/**
 * Schema.org Checker
 * Validates JSON-LD structured data implementation
 * Weight: 20%
 */

import type { CheckResult } from './base';
import { createSuccessResult, createFailureResult, createPartialResult } from './base';

interface SchemaType {
  readonly name: string;
  readonly weight: number;
  readonly patterns: readonly RegExp[];
}

const schemaTypes: readonly SchemaType[] = [
  {
    name: 'Organization',
    weight: 30,
    patterns: [/"@type"\s*:\s*"Organization"/i],
  },
  {
    name: 'WebSite',
    weight: 25,
    patterns: [/"@type"\s*:\s*"WebSite"/i],
  },
  {
    name: 'WebPage',
    weight: 20,
    patterns: [/"@type"\s*:\s*"WebPage"/i],
  },
  {
    name: 'BreadcrumbList',
    weight: 15,
    patterns: [/"@type"\s*:\s*"BreadcrumbList"/i],
  },
  {
    name: 'Article/BlogPosting',
    weight: 10,
    patterns: [/"@type"\s*:\s*"Article"/i, /"@type"\s*:\s*"BlogPosting"/i],
  },
];

export function checkSchema(_url: string, html: string): CheckResult {
  // Extract all JSON-LD scripts
  const jsonLdScripts: string[] = [];
  const scriptRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = scriptRegex.exec(html)) !== null) {
    if (match[1]) {
      jsonLdScripts.push(match[1]);
    }
  }

  if (jsonLdScripts.length === 0) {
    return createFailureResult('No Schema.org JSON-LD found', {
      totalSchemas: 0,
      typesFound: [],
      missingTypes: schemaTypes.map((t) => t.name),
    });
  }

  // Check each schema type
  const typesFound: string[] = [];
  const missingTypes: string[] = [];
  let weightedScore = 0;

  for (const schemaType of schemaTypes) {
    const found = schemaType.patterns.some((pattern) =>
      jsonLdScripts.some((script) => pattern.test(script))
    );

    if (found) {
      typesFound.push(schemaType.name);
      weightedScore += schemaType.weight;
    } else {
      missingTypes.push(schemaType.name);
    }
  }

  // Validate JSON syntax
  const validSchemas: string[] = [];
  const invalidSchemas: string[] = [];

  for (const script of jsonLdScripts) {
    try {
      JSON.parse(script);
      validSchemas.push(script.substring(0, 100) + '...');
    } catch {
      invalidSchemas.push(script.substring(0, 100) + '...');
    }
  }

  const warnings: string[] = [];
  if (invalidSchemas.length > 0) {
    warnings.push(`${invalidSchemas.length} invalid JSON-LD script(s) found`);
  }
  if (!typesFound.includes('Organization')) {
    warnings.push('Missing Organization schema (critical for AI understanding)');
  }
  if (!typesFound.includes('WebSite')) {
    warnings.push('Missing WebSite schema');
  }

  const finalScore = invalidSchemas.length > 0 ? Math.floor(weightedScore * 0.5) : weightedScore;

  if (finalScore >= 80) {
    return createSuccessResult(
      `${typesFound.length} schema types found (${typesFound.join(', ')})`,
      finalScore,
      {
        totalSchemas: jsonLdScripts.length,
        validSchemas: validSchemas.length,
        typesFound,
        missingTypes,
      },
      warnings.length > 0 ? warnings : undefined
    );
  }

  if (finalScore >= 40) {
    return createPartialResult(
      `Partial Schema: ${typesFound.length}/${schemaTypes.length} types found`,
      finalScore,
      {
        totalSchemas: jsonLdScripts.length,
        typesFound,
        missingTypes,
      },
      warnings.length > 0 ? warnings : undefined
    );
  }

  return createFailureResult(
    'Schema.org JSON-LD found but missing important types',
    {
      totalSchemas: jsonLdScripts.length,
      typesFound,
      missingTypes: schemaTypes.map((t) => t.name),
    }
  );
}
