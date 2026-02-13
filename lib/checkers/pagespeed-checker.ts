/**
 * Page Speed Checker
 * Basic load time measurement
 * Weight: 5%
 */

import type { CheckResult } from './base';
import { createSuccessResult } from './base';

interface SpeedThreshold {
  readonly max: number;
  readonly score: number;
  readonly label: string;
}

const SPEED_THRESHOLDS: readonly SpeedThreshold[] = [
  { max: 1000, score: 100, label: 'excellent' },
  { max: 2000, score: 80, label: 'good' },
  { max: 3000, score: 60, label: 'fair' },
  { max: 5000, score: 40, label: 'slow' },
];

/**
 * Evaluates page speed using the TTFB measured during the initial HTML fetch
 * in the API route. This avoids a duplicate HTTP request to the target site.
 */
export function checkPageSpeed(ttfb: number): CheckResult {
  // Determine score based on response time
  let score = 20;
  let label = 'very slow';
  for (const threshold of SPEED_THRESHOLDS) {
    if (ttfb < threshold.max) {
      score = threshold.score;
      label = threshold.label;
      break;
    }
  }

  const warnings: string[] = [];
  if (ttfb > 3000) {
    warnings.push('Page is slow, needs optimization');
  }

  const data: Record<string, unknown> = {
    loadTime: ttfb,
    label,
    note: 'Measured as server response time (TTFB). Use Google PSI API for full load metrics.',
  };

  return createSuccessResult(
    `Server responded in ${ttfb}ms (${label})`,
    score,
    data,
    warnings.length > 0 ? warnings : undefined
  );
}
