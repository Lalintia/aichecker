/**
 * Tests for Base utilities
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  getGrade,
  calculateOverallScore,
  createSuccessResult,
  createFailureResult,
  createPartialResult,
} from '../base';
import type { CheckResult } from '../base';

describe('getGrade', () => {
  it('should return excellent for score >= 90', () => {
    assert.strictEqual(getGrade(90), 'excellent');
    assert.strictEqual(getGrade(95), 'excellent');
    assert.strictEqual(getGrade(100), 'excellent');
  });

  it('should return good for score >= 70', () => {
    assert.strictEqual(getGrade(70), 'good');
    assert.strictEqual(getGrade(80), 'good');
    assert.strictEqual(getGrade(89), 'good');
  });

  it('should return fair for score >= 50', () => {
    assert.strictEqual(getGrade(50), 'fair');
    assert.strictEqual(getGrade(60), 'fair');
    assert.strictEqual(getGrade(69), 'fair');
  });

  it('should return poor for score < 50', () => {
    assert.strictEqual(getGrade(49), 'poor');
    assert.strictEqual(getGrade(0), 'poor');
    assert.strictEqual(getGrade(25), 'poor');
  });
});

describe('calculateOverallScore', () => {
  it('should calculate weighted score correctly', () => {
    const checks: Record<string, CheckResult> = {
      test1: { found: true, details: 'Test 1', score: 100, data: {} },
      test2: { found: true, details: 'Test 2', score: 50, data: {} },
    };
    const weights = { test1: 50, test2: 50 };

    const score = calculateOverallScore(checks, weights);
    assert.strictEqual(score, 75); // (100 * 0.5) + (50 * 0.5) = 75
  });

  it('should handle missing checks', () => {
    const checks: Record<string, CheckResult> = {
      test1: { found: true, details: 'Test 1', score: 100, data: {} },
    };
    const weights = { test1: 50, test2: 50 };

    const score = calculateOverallScore(checks, weights);
    assert.strictEqual(score, 50); // (100 * 0.5) + (0 * 0.5) = 50
  });
});

describe('createSuccessResult', () => {
  it('should create success result with all properties', () => {
    const result = createSuccessResult('Success', 100, { key: 'value' }, ['warning']);

    assert.strictEqual(result.found, true);
    assert.strictEqual(result.details, 'Success');
    assert.strictEqual(result.score, 100);
    assert.deepStrictEqual(result.data, { key: 'value' });
    assert.deepStrictEqual(result.warnings, ['warning']);
  });

  it('should omit warnings when not provided', () => {
    const result = createSuccessResult('Success', 100);

    assert.strictEqual(result.found, true);
    assert.strictEqual(result.warnings, undefined);
  });
});

describe('createFailureResult', () => {
  it('should create failure result', () => {
    const result = createFailureResult('Failed', { error: 'test' });

    assert.strictEqual(result.found, false);
    assert.strictEqual(result.details, 'Failed');
    assert.strictEqual(result.score, 0);
    assert.deepStrictEqual(result.data, { error: 'test' });
  });

  it('should use default empty data', () => {
    const result = createFailureResult('Failed');

    assert.deepStrictEqual(result.data, {});
  });
});

describe('createPartialResult', () => {
  it('should create partial result', () => {
    const result = createPartialResult('Partial', 50, { info: 'test' });

    assert.strictEqual(result.found, true);
    assert.strictEqual(result.details, 'Partial');
    assert.strictEqual(result.score, 50);
    assert.deepStrictEqual(result.data, { info: 'test' });
  });

  it('should treat score 0 as not found', () => {
    const result = createPartialResult('Partial', 0);

    assert.strictEqual(result.found, false);
  });
});
