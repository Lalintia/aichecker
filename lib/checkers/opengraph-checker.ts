/**
 * Open Graph Checker
 * Validates Open Graph meta tags for social sharing
 * Weight: 15%
 */

import type { CheckResult } from './base';
import { createSuccessResult, createFailureResult, createPartialResult } from './base';
import { sanitizeContent } from '@/lib/security';

interface OGProperty {
  readonly name: string;
  readonly weight: number;
  readonly required: boolean;
  readonly propPattern: RegExp;
  readonly namePattern: RegExp;
  readonly contentPattern: RegExp;
}

const OG_PROPERTIES: readonly OGProperty[] = [
  { name: 'og:title', weight: 25, required: true,
    propPattern: /<meta[^>]+property=["']og:title["'][^>]*>/i,
    namePattern: /<meta[^>]+name=["']og:title["'][^>]*>/i,
    contentPattern: /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i },
  { name: 'og:description', weight: 25, required: true,
    propPattern: /<meta[^>]+property=["']og:description["'][^>]*>/i,
    namePattern: /<meta[^>]+name=["']og:description["'][^>]*>/i,
    contentPattern: /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i },
  { name: 'og:image', weight: 25, required: true,
    propPattern: /<meta[^>]+property=["']og:image["'][^>]*>/i,
    namePattern: /<meta[^>]+name=["']og:image["'][^>]*>/i,
    contentPattern: /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i },
  { name: 'og:type', weight: 15, required: true,
    propPattern: /<meta[^>]+property=["']og:type["'][^>]*>/i,
    namePattern: /<meta[^>]+name=["']og:type["'][^>]*>/i,
    contentPattern: /<meta[^>]+property=["']og:type["'][^>]+content=["']([^"']+)["']/i },
  { name: 'og:url', weight: 10, required: false,
    propPattern: /<meta[^>]+property=["']og:url["'][^>]*>/i,
    namePattern: /<meta[^>]+name=["']og:url["'][^>]*>/i,
    contentPattern: /<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i },
];

export function checkOpenGraph(html: string): CheckResult {
  const found: string[] = [];
  const missing: string[] = [];
  const warnings: string[] = [];
  let weightedScore = 0;

  for (const prop of OG_PROPERTIES) {
    const hasProperty = prop.propPattern.test(html) || prop.namePattern.test(html);

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

  // Extract values for additional validation using pre-compiled patterns.
  // Length checks run on raw values before sanitization to avoid counting
  // HTML entities (e.g. &amp; = 5 chars) as part of the original content length.
  const rawExtracted: Record<string, string> = {};
  const extracted: Record<string, string> = {};
  for (const prop of OG_PROPERTIES) {
    const match = html.match(prop.contentPattern);
    if (match) {
      rawExtracted[prop.name] = match[1];
      extracted[prop.name] = sanitizeContent(match[1], 500);
    }
  }

  // Validate image URL if present
  if (extracted['og:image']) {
    if (!extracted['og:image'].startsWith('http')) {
      warnings.push('og:image URL should be absolute');
      weightedScore -= 5;
    }
  }

  // Validate title length (use raw value to avoid entity inflation)
  if (rawExtracted['og:title'] && rawExtracted['og:title'].length > 60) {
    warnings.push('og:title is too long (>60 chars)');
  }

  // Validate description length (use raw value to avoid entity inflation)
  if (rawExtracted['og:description'] && rawExtracted['og:description'].length > 200) {
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
