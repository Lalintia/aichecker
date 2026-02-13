/**
 * Sitemap Checker
 * Validates sitemap.xml existence and content
 * Weight: 10%
 */

import type { CheckResult } from './base';
import { createSuccessResult, createFailureResult, createPartialResult } from './base';
import { isSafeUrl, sanitizeContent } from '@/lib/security';

export async function checkSitemap(
  url: string,
  robotsContent?: string
): Promise<CheckResult> {
  try {
    const urlObj = new URL(url);
    let sitemapUrls: string[] = [];

    // First, try to find sitemap from robots.txt
    // Only accept URLs on the same origin to prevent SSRF via robots.txt content
    if (robotsContent) {
      const sitemapMatches = robotsContent.match(/Sitemap:\s*(.+)/gi);
      if (sitemapMatches) {
        sitemapUrls = sitemapMatches
          .map((m) => {
            const match = m.match(/Sitemap:\s*(.+)/i);
            return match ? match[1].trim() : '';
          })
          .filter((sitemapUrl) => {
            if (!sitemapUrl) return false;
            try {
              return new URL(sitemapUrl).host === urlObj.host;
            } catch {
              return false;
            }
          });
      }
    }

    // If no sitemap found in robots.txt, try common locations
    if (sitemapUrls.length === 0) {
      sitemapUrls = [
        `${urlObj.protocol}//${urlObj.host}/sitemap.xml`,
        `${urlObj.protocol}//${urlObj.host}/sitemap_index.xml`,
      ];
    }

    let foundSitemap: { url: string; fullContent: string; content: string; urls: number } | null = null;
    const errors: string[] = [];

    for (const sitemapUrl of sitemapUrls) {
      try {
        // Validate URL before fetching (SSRF protection)
        if (!isSafeUrl(sitemapUrl)) {
          errors.push(`${sitemapUrl}: URL not allowed`);
          continue;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        let response: Response;
        try {
          response = await fetch(sitemapUrl, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; AISearchChecker/1.0)',
              Accept: 'application/xml,text/xml',
            },
            redirect: 'manual',
            next: { revalidate: 0 },
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeoutId);
        }

        if (response.ok) {
          // Limit response size to prevent memory exhaustion (5MB max)
          const MAX_SITEMAP_SIZE = 5 * 1024 * 1024; // 5MB
          const contentLength = response.headers.get('content-length');
          if (contentLength && parseInt(contentLength, 10) > MAX_SITEMAP_SIZE) {
            errors.push(`${sitemapUrl}: Sitemap too large`);
            continue;
          }
          const content = await response.text();
          if (content.length > MAX_SITEMAP_SIZE) {
            errors.push(`${sitemapUrl}: Sitemap too large`);
            continue;
          }

          // Check if it's a valid sitemap
          if (content.includes('<urlset') || content.includes('<sitemapindex')) {
            // Count URLs
            const urlMatches = content.match(/<url>/g);
            const urlCount = urlMatches ? urlMatches.length : 0;

            foundSitemap = {
              url: sitemapUrl,
              fullContent: content,
              content: sanitizeContent(content, 500),
              urls: urlCount,
            };
            break;
          } else {
            errors.push(`${sitemapUrl}: Not a valid sitemap format`);
          }
        } else {
          errors.push(`${sitemapUrl}: HTTP ${response.status}`);
        }
      } catch (err) {
        errors.push(`${sitemapUrl}: ${err instanceof Error ? err.message : 'Fetch error'}`);
      }
    }

    if (!foundSitemap) {
      return createFailureResult('Sitemap.xml not found', {
        checkedUrls: sitemapUrls,
        errors,
      });
    }

    // Validate against full content, not the 500-char truncated preview
    const fullContent = foundSitemap.fullContent;
    const hasUrlset = fullContent.includes('<urlset');
    const hasSitemapIndex = fullContent.includes('<sitemapindex');
    const hasUrls = foundSitemap.urls > 0;
    const hasLastmod = fullContent.includes('<lastmod>');
    const hasChangefreq = fullContent.includes('<changefreq>');
    const hasPriority = fullContent.includes('<priority>');

    let score = 100;
    if (!hasUrls) score -= 30;
    if (!hasLastmod) score -= 10;
    if (!hasChangefreq) score -= 10;
    if (!hasPriority) score -= 5;

    score = Math.max(0, score);

    const data: Record<string, unknown> = {
      url: foundSitemap.url,
      urls: foundSitemap.urls,
      hasUrlset,
      hasSitemapIndex,
      hasLastmod,
      hasChangefreq,
      hasPriority,
      type: hasSitemapIndex ? 'sitemapindex' : 'urlset',
    };

    if (score >= 80) {
      return createSuccessResult(
        `Sitemap found with ${foundSitemap.urls} URLs`,
        score,
        data
      );
    }

    return createPartialResult(
      `Sitemap found but missing some optional fields`,
      score,
      data
    );
  } catch (error) {
    return createFailureResult('Unable to check sitemap', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
