/**
 * Base types and utilities for checkers
 */

import type { CheckResult, CheckGrade, Recommendation } from '@/lib/types/checker';

export type { CheckResult };

export interface Checker {
  name: string;
  weight: number;
  check(url: string, html: string): Promise<CheckResult> | CheckResult;
}

export const weights = {
  schema: 20,
  robotsTxt: 15,
  llmsTxt: 15,
  sitemap: 10,
  openGraph: 15,
  semanticHTML: 5,
  headingHierarchy: 5,
  faqBlocks: 5,
  pageSpeed: 5,
  authorAuthority: 5,
} as const;

export type CheckType = keyof typeof weights;

export function getGrade(score: number): CheckGrade {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
}

export function calculateOverallScore(
  checks: Record<string, CheckResult>,
  weightMap: Record<string, number>
): number {
  let totalScore = 0;
  for (const [key, weight] of Object.entries(weightMap)) {
    const check = checks[key];
    if (check) {
      totalScore += (check.score || 0) * (weight / 100);
    }
  }
  return Math.round(totalScore);
}

export function generateRecommendations(
  checks: Record<CheckType, CheckResult>
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  if (!checks.schema.found || checks.schema.score! < 80) {
    recommendations.push({
      priority: 'critical',
      category: 'Schema.org',
      message: 'Schema.org JSON-LD not found or incomplete',
      action: 'Install Schema.org JSON-LD (Organization, WebSite)',
    });
  }

  if (!checks.llmsTxt.found || checks.llmsTxt.score! < 60) {
    recommendations.push({
      priority: 'high',
      category: 'llms.txt',
      message: checks.llmsTxt.found ? 'llms.txt needs improvement' : 'llms.txt file not found',
      action: 'Create llms.txt following Answer.AI standard',
    });
  }

  if (!checks.robotsTxt.found) {
    recommendations.push({
      priority: 'critical',
      category: 'robots.txt',
      message: 'robots.txt not found',
      action: 'Create robots.txt and specify Sitemap',
    });
  } else if (checks.robotsTxt.warnings?.some((w) => w.includes('GPTBot'))) {
    recommendations.push({
      priority: 'high',
      category: 'robots.txt',
      message: 'May block AI crawlers',
      action: 'Ensure GPTBot, ChatGPT-User are not blocked',
    });
  }

  if (!checks.sitemap.found) {
    recommendations.push({
      priority: 'high',
      category: 'Sitemap',
      message: 'Sitemap.xml not found',
      action: 'Create Sitemap.xml and reference it in robots.txt',
    });
  }

  if (!checks.openGraph.found || checks.openGraph.score! < 80) {
    recommendations.push({
      priority: 'medium',
      category: 'Open Graph',
      message: 'Open Graph is incomplete',
      action: 'Add og:title, og:description, og:image, og:type',
    });
  }

  if (!checks.semanticHTML.found) {
    recommendations.push({
      priority: 'medium',
      category: 'Semantic HTML',
      message: 'Too many <div> elements',
      action: 'Use semantic elements: <header>, <main>, <article>, <section>',
    });
  }

  if (checks.headingHierarchy.score! < 70) {
    recommendations.push({
      priority: 'medium',
      category: 'Headings',
      message: 'Heading Hierarchy issues',
      action: 'Have 1 H1, followed by H2, H3 in order',
    });
  }

  if (!checks.faqBlocks.found) {
    recommendations.push({
      priority: 'low',
      category: 'FAQ',
      message: 'No FAQ/QA blocks found',
      action: 'Add FAQ Schema and Q&A format',
    });
  }

  if (checks.pageSpeed.score! < 60) {
    recommendations.push({
      priority: 'high',
      category: 'Performance',
      message: 'Website loads slowly',
      action: 'Improve Core Web Vitals, optimize images',
    });
  }

  if (!checks.authorAuthority.found) {
    recommendations.push({
      priority: 'low',
      category: 'EEAT',
      message: 'No author information found',
      action: 'Add Author meta, Publisher info per EEAT guidelines',
    });
  }

  return recommendations;
}

export function createSuccessResult(
  details: string,
  score: number,
  data?: Record<string, unknown>,
  warnings?: string[]
): CheckResult {
  return {
    found: true,
    details,
    score,
    data: data || {},
    ...(warnings && warnings.length > 0 ? { warnings } : {}),
  };
}

export function createFailureResult(
  details: string,
  data?: Record<string, unknown>
): CheckResult {
  return {
    found: false,
    details,
    score: 0,
    data: data || {},
  };
}

export function createPartialResult(
  details: string,
  score: number,
  data?: Record<string, unknown>,
  warnings?: string[]
): CheckResult {
  return {
    found: score > 0,
    details,
    score,
    data: data || {},
    ...(warnings && warnings.length > 0 ? { warnings } : {}),
  };
}
