/**
 * Page Speed Checker
 * Basic load time measurement
 * Weight: 5%
 */

import type { CheckResult } from './base';
import { createSuccessResult, createFailureResult } from './base';

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

export async function checkPageSpeed(url: string): Promise<CheckResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'GET',
      next: { revalidate: 0 },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const loadTime = Date.now() - startTime;

    if (!response.ok) {
      return createFailureResult(`Failed to measure: HTTP ${response.status}`, {
        status: response.status,
      });
    }

    // Determine score based on load time
    let score = 20;
    let label = 'very slow';
    for (const threshold of SPEED_THRESHOLDS) {
      if (loadTime < threshold.max) {
        score = threshold.score;
        label = threshold.label;
        break;
      }
    }

    const warnings: string[] = [];
    if (loadTime > 3000) {
      warnings.push('Page is slow, needs optimization');
    }

    const data: Record<string, unknown> = {
      loadTime,
      label,
      note: 'Use Google PSI API for more accurate results',
    };

    return createSuccessResult(
      `Page loaded in ${loadTime}ms (${label})`,
      score,
      data,
      warnings.length > 0 ? warnings : undefined
    );
  } catch (error) {
    return createFailureResult('Unable to measure page speed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
