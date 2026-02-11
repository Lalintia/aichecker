/**
 * Open Graph Checker
 * Validates Open Graph meta tags for social sharing
 * Weight: 15%
 */

import type { CheckResult } from './base';
import { createSuccessResult, createFailureResult, createPartialResult } from './base';

interface OGProperty {
  readonly name: string;
  readonly weight: number;
  readonly required: boolean;
}

const OG_PROPERTIES: readonly OGProperty[] = [
  { name: 'og:title', weight: 25, required: true },
  { name: 'og:description', weight: 25, required: true },
  { name: 'og:image', weight: 25, required: true },
  { name: 'og:type', weight: 15, required: true },
  { name: 'og:url', weight: 10, required: false },
];

export function checkOpenGraph(html: string): CheckResult {
  const found: string[] = [];
  const missing: string[] = [];
  const warnings: string[] = [];
  let weightedScore = 0;

  for (const prop of OG_PROPERTIES) {
    // Check for property="name" format
    const propPattern = new RegExp(
      `<meta[^>]+property=["']${prop.name}["'][^>]*>`,
      'i'
    );
    // Check for name="name" format (alternate)
    const namePattern = new RegExp(`<meta[^>]+name=["']${prop.name}["'][^>]*>`, 'i');

    const hasProperty = propPattern.test(html) || namePattern.test(html);

    if (hasProperty) {
      found.push(prop.name);
      weightedScore += prop.weight;
    } else {
      missing.push(prop.name);
      if (prop.required) {
        warnings.push(`Missing ${prop.name}`);
      }
    }
  }

  // Extract values for additional validation
  const extracted: Record<string, string> = {};
  for (const prop of OG_PROPERTIES) {
    const regex = new RegExp(
      `<meta[^>]+property=["']${prop.name}["'][^>]+content=["']([^"']+)["']`,
      'i'
    );
    const match = html.match(regex);
    if (match) {
      extracted[prop.name] = match[1];
    }
  }

  // Validate image URL if present
  if (extracted['og:image']) {
    if (!extracted['og:image'].startsWith('http')) {
      warnings.push('og:image URL should be absolute');
      weightedScore -= 5;
    }
  }

  // Validate title length
  if (extracted['og:title'] && extracted['og:title'].length > 60) {
    warnings.push('og:title is too long (>60 chars)');
  }

  // Validate description length
  if (extracted['og:description'] && extracted['og:description'].length > 200) {
    warnings.push('og:description is too long (>200 chars)');
  }

  const finalScore = Math.max(0, weightedScore);

  const data: Record<string, unknown> = {
    found,
    missing,
    extracted,
  };

  if (finalScore >= 80) {
    return createSuccessResult(
      `${found.length}/${OG_PROPERTIES.length} Open Graph tags found`,
      finalScore,
      data,
      warnings.length > 0 ? warnings : undefined
    );
  }

  if (finalScore >= 40) {
    return createPartialResult(
      `Partial Open Graph: ${found.length}/${OG_PROPERTIES.length} tags`,
      finalScore,
      data,
      warnings.length > 0 ? warnings : undefined
    );
  }

  return createFailureResult(
    'Open Graph meta tags not found or incomplete',
    data
  );
}
