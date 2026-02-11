/**
 * Sitemap Checker
 * Validates sitemap.xml existence and content
 * Weight: 10%
 */

import type { CheckResult } from './base';
import { createSuccessResult, createFailureResult, createPartialResult } from './base';

export async function checkSitemap(
  url: string,
  robotsContent?: string
): Promise<CheckResult> {
  try {
    const urlObj = new URL(url);
    let sitemapUrls: string[] = [];

    // First, try to find sitemap from robots.txt
    if (robotsContent) {
      const sitemapMatches = robotsContent.match(/Sitemap:\s*(.+)/gi);
      if (sitemapMatches) {
        sitemapUrls = sitemapMatches.map((m) => {
          const match = m.match(/Sitemap:\s*(.+)/i);
          return match ? match[1].trim() : '';
        }).filter(Boolean);
      }
    }

    // If no sitemap found in robots.txt, try common locations
    if (sitemapUrls.length === 0) {
      sitemapUrls = [
        `${urlObj.protocol}//${urlObj.host}/sitemap.xml`,
        `${urlObj.protocol}//${urlObj.host}/sitemap_index.xml`,
      ];
    }

    let foundSitemap: { url: string; content: string; urls: number } | null = null;
    const errors: string[] = [];

    for (const sitemapUrl of sitemapUrls) {
      try {
        const response = await fetch(sitemapUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; AISearchChecker/1.0)',
            Accept: 'application/xml,text/xml',
          },
          next: { revalidate: 0 },
        });

        if (response.ok) {
          const content = await response.text();

          // Check if it's a valid sitemap
          if (content.includes('<urlset') || content.includes('<sitemapindex')) {
            // Count URLs
            const urlMatches = content.match(/<url>/g);
            const urlCount = urlMatches ? urlMatches.length : 0;

            foundSitemap = {
              url: sitemapUrl,
              content: content.substring(0, 500),
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

    // Validate sitemap content
    const content = foundSitemap.content;
    const hasUrlset = content.includes('<urlset');
    const hasSitemapIndex = content.includes('<sitemapindex');
    const hasUrls = foundSitemap.urls > 0;
    const hasLastmod = content.includes('<lastmod>');
    const hasChangefreq = content.includes('<changefreq>');
    const hasPriority = content.includes('<priority>');

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
