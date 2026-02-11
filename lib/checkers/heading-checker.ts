/**
 * Heading Hierarchy Checker
 * Validates proper heading structure (H1-H6)
 * Weight: 5%
 */

import type { CheckResult } from './base';
import { createSuccessResult, createFailureResult, createPartialResult } from './base';

export function checkHeadingHierarchy(html: string): CheckResult {
  const warnings: string[] = [];

  // Extract all headings with their levels
  const headings: { level: number; text: string }[] = [];
  const headingRegex = /<h([1-6])[^>]*>(?:<[^>]+>)*([^<]+)(?:<\/[^>]+>)*<\/h[1-6]>/gi;
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(html)) !== null) {
    if (match[1] && match[2]) {
      headings.push({
        level: parseInt(match[1], 10),
        text: match[2].trim(),
      });
    }
  }

  if (headings.length === 0) {
    return createFailureResult('No headings found (H1-H6)', {
      headings: [],
    });
  }

  // Count H1s (should be exactly 1)
  const h1Count = headings.filter((h) => h.level === 1).length;
  const h2Count = headings.filter((h) => h.level === 2).length;
  const h3Count = headings.filter((h) => h.level === 3).length;

  // Check for hierarchy violations
  let violations = 0;
  let prevLevel = 0;

  for (const heading of headings) {
    if (heading.level > prevLevel + 1) {
      violations++;
    }
    prevLevel = heading.level;
  }

  // Generate warnings
  if (h1Count === 0) {
    warnings.push('Missing H1 tag (critical for SEO)');
  } else if (h1Count > 1) {
    warnings.push(`Multiple H1 tags found (${h1Count}), should have only 1`);
  }

  if (violations > 0) {
    warnings.push(`Heading hierarchy violations found (${violations} skips)`);
  }

  // Calculate score
  let score = 100;
  if (h1Count === 0) score -= 30;
  if (h1Count > 1) score -= 20;
  if (violations > 0) score -= violations * 10;
  if (h2Count === 0) score -= 15;

  score = Math.max(0, score);

  const data: Record<string, unknown> = {
    h1Count,
    h2Count,
    h3Count,
    totalHeadings: headings.length,
    violations,
    headings: headings.slice(0, 10), // First 10 headings
  };

  if (score >= 80) {
    return createSuccessResult(
      `Heading hierarchy correct (${headings.length} headings)`,
      score,
      data,
      warnings.length > 0 ? warnings : undefined
    );
  }

  if (score >= 50) {
    return createPartialResult(
      `Heading hierarchy needs improvement`,
      score,
      data,
      warnings.length > 0 ? warnings : undefined
    );
  }

  return {
    found: false,
    score,
    details: 'Heading hierarchy has significant issues',
    data,
    ...(warnings.length > 0 ? { warnings } : {}),
  };
}
