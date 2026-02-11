/**
 * AI Search Checker API Route
 * Modular implementation using lib/checkers
 */

import { NextRequest, NextResponse } from 'next/server';
import type { CheckResponse } from '@/lib/types/checker';
import {
  checkSchema,
  checkRobotsTxt,
  checkLlmsTxt,
  checkSitemap,
  checkOpenGraph,
  checkSemanticHTML,
  checkHeadingHierarchy,
  checkFAQBlocks,
  checkPageSpeed,
  checkAuthorAuthority,
  weights,
  getGrade,
  calculateOverallScore,
  generateRecommendations,
} from '@/lib/checkers';

// URL normalization utilities
function normalizeUrl(url: string): string {
  let normalized = url.trim();
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = `https://${normalized}`;
  }
  return normalized.replace(/\/$/, '');
}

// SSRF protection - block internal IPs
function isInternalIp(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // Block localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
    
    // Block private IP ranges
    const privateRanges = [
      /^10\./,                              // 10.0.0.0/8
      /^172\.(1[6-9]|2[0-9]|3[01])\./,     // 172.16.0.0/12
      /^192\.168\./,                        // 192.168.0.0/16
      /^127\./,                             // 127.0.0.0/8
      /^169\.254\./,                        // Link-local
      /^0\./,                               // 0.0.0.0/8
      /^::1$/,                              // IPv6 localhost
      /^fc00:/i,                            // IPv6 private
      /^fe80:/i,                            // IPv6 link-local
    ];
    
    return privateRanges.some((range) => range.test(hostname));
  } catch {
    return true; // Invalid URL, treat as blocked
  }
}

// API Route Handler
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'Please enter a URL' },
        { status: 400 }
      );
    }

    const normalizedUrl = normalizeUrl(url);

    // SSRF protection
    if (isInternalIp(normalizedUrl)) {
      return NextResponse.json(
        { error: 'Invalid URL. Cannot scan internal addresses.' },
        { status: 400 }
      );
    }

    // Fetch HTML once with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const pageResponse = await fetch(normalizedUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AISearchChecker/1.0)',
        Accept: 'text/html',
      },
      next: { revalidate: 0 },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!pageResponse.ok) {
      return NextResponse.json(
        { error: `Unable to access website (${pageResponse.status})` },
        { status: 400 }
      );
    }

    const html = await pageResponse.text();

    // Run all checks
    const [
      schemaResult,
      robotsResult,
      llmsResult,
      initialSitemapResult,
      ogResult,
      semanticResult,
      headingResult,
      faqResult,
      speedResult,
      authorResult,
    ] = await Promise.all([
      Promise.resolve(checkSchema(normalizedUrl, html)),
      checkRobotsTxt(normalizedUrl),
      checkLlmsTxt(normalizedUrl),
      checkSitemap(normalizedUrl, undefined),
      Promise.resolve(checkOpenGraph(html)),
      Promise.resolve(checkSemanticHTML(html)),
      Promise.resolve(checkHeadingHierarchy(html)),
      Promise.resolve(checkFAQBlocks(html)),
      checkPageSpeed(normalizedUrl),
      Promise.resolve(checkAuthorAuthority(html)),
    ]);

    // If robots.txt exists, check sitemap again with robots data
    let sitemapResult = initialSitemapResult;
    if (robotsResult.found && robotsResult.data?.content) {
      const content = String(robotsResult.data.content);
      const updatedSitemap = await checkSitemap(normalizedUrl, content);
      if (updatedSitemap.found) {
        // Create new result with merged data (respecting readonly)
        sitemapResult = {
          ...initialSitemapResult,
          data: { ...initialSitemapResult.data, ...updatedSitemap.data },
        };
      }
    }

    const checks = {
      schema: schemaResult,
      robotsTxt: robotsResult,
      llmsTxt: llmsResult,
      sitemap: sitemapResult,
      openGraph: ogResult,
      semanticHTML: semanticResult,
      headingHierarchy: headingResult,
      faqBlocks: faqResult,
      pageSpeed: speedResult,
      authorAuthority: authorResult,
    };

    const overallScore = calculateOverallScore(checks, weights);
    const grade = getGrade(overallScore);
    const recommendations = generateRecommendations(checks);

    // Count stats
    const passed = Object.values(checks).filter((c) => c.score >= 70).length;
    const warning = Object.values(checks).filter(
      (c) => c.score >= 50 && c.score < 70
    ).length;
    const failed = Object.values(checks).filter((c) => c.score < 50).length;

    const response: CheckResponse = {
      url: normalizedUrl,
      overallScore,
      grade,
      checks,
      recommendations,
      summary: {
        passed,
        warning,
        failed,
        total: 10,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Check error:', error);
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}
