/**
 * robots.txt Checker
 * Validates robots.txt configuration for AI crawlers
 * Weight: 15%
 */

import type { CheckResult } from './base';
import { createSuccessResult, createFailureResult, createPartialResult } from './base';

const AI_BOTS = [
  { name: 'GPTBot', critical: true },
  { name: 'ChatGPT-User', critical: true },
  { name: 'Claude-Web', critical: false },
  { name: 'CCBot', critical: false },
  { name: 'PerplexityBot', critical: false },
  { name: 'Google-Extended', critical: false },
] as const;

export async function checkRobotsTxt(url: string): Promise<CheckResult> {
  try {
    const urlObj = new URL(url);
    const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;

    const response = await fetch(robotsUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AISearchChecker/1.0)',
        Accept: 'text/plain',
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return createFailureResult('robots.txt not found (HTTP 404)', {
          status: response.status,
          url: robotsUrl,
        });
      }
      return createFailureResult(`robots.txt returned HTTP ${response.status}`, {
        status: response.status,
        url: robotsUrl,
      });
    }

    const content = await response.text();

    // Check for basic content
    const hasUserAgent = /User-agent:/i.test(content);
    const hasAllow = /Allow:/i.test(content);
    const hasDisallow = /Disallow:/i.test(content);
    const hasSitemap = /Sitemap:/i.test(content);

    if (!hasUserAgent) {
      return createFailureResult('robots.txt exists but missing User-agent', {
        content: content.substring(0, 500),
      });
    }

    // Check for AI bot blocking
    const blockedBots: string[] = [];
    const allowedBots: string[] = [];
    const warnings: string[] = [];

    // Check if ALL bots are blocked globally (Disallow: / with nothing after)
    // This regex looks for Disallow: / followed by end of line or comment
    const globalBlockPattern = /User-agent:\s*\*\s*\n(?:[^U]*\n)*?\s*Disallow:\s*\/(?:\s*(?:#|$))/im;
    const isBlockedGlobally = globalBlockPattern.test(content);

    for (const bot of AI_BOTS) {
      // Check if bot is explicitly blocked (User-agent: BotName + Disallow: /)
      const botSpecificPattern = new RegExp(
        `User-agent:\\s*${bot.name}\\s*\\n(?:[^U]*\\n)*?\\s*Disallow:\\s*\\/(?:\\s*(?:#|$))`,
        'im'
      );
      const isBlockedSpecifically = botSpecificPattern.test(content);

      if (isBlockedGlobally || isBlockedSpecifically) {
        blockedBots.push(bot.name);
        if (bot.critical) {
          warnings.push(`${bot.name} may be blocked from crawling`);
        }
      } else {
        allowedBots.push(bot.name);
      }
    }

    // Calculate score
    let score = 100;
    if (blockedBots.length > 0) {
      const criticalBlocked = AI_BOTS.filter(
        (b) => b.critical && blockedBots.includes(b.name)
      ).length;
      score -= criticalBlocked * 20;
      score -= (blockedBots.length - criticalBlocked) * 5;
    }

    // Check sitemap reference
    if (!hasSitemap) {
      warnings.push('Sitemap not referenced in robots.txt');
      score -= 10;
    }

    score = Math.max(0, Math.min(100, score));

    if (score >= 80) {
      return createSuccessResult(
        `robots.txt configured correctly (${blockedBots.length} bots blocked)`,
        score,
        {
          hasUserAgent,
          hasAllow,
          hasDisallow,
          hasSitemap,
          blockedBots,
          allowedBots,
          content: content.substring(0, 1000),
        },
        warnings.length > 0 ? warnings : undefined
      );
    }

    return createPartialResult(
      `robots.txt exists but ${blockedBots.length} AI bots may be blocked`,
      score,
      {
        hasUserAgent,
        hasAllow,
        hasDisallow,
        hasSitemap,
        blockedBots,
        allowedBots,
        content: content.substring(0, 500),
      },
      warnings.length > 0 ? warnings : undefined
    );
  } catch (error) {
    return createFailureResult('Unable to check robots.txt', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
