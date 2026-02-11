/**
 * Tests for Open Graph Checker
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { checkOpenGraph } from '../opengraph-checker';

describe('checkOpenGraph', () => {
  it('should return failure when no Open Graph tags found', () => {
    const html = '<html><head></head><body>No OG tags</body></html>';
    const result = checkOpenGraph(html);

    assert.strictEqual(result.found, false);
    assert.strictEqual(result.score, 0);
  });

  it('should detect OG tags', () => {
    const html = `
      <html>
        <head>
          <meta property="og:title" content="Test Title">
          <meta property="og:description" content="Test Description">
        </head>
      </html>
    `;
    const result = checkOpenGraph(html);

    // Should have partial score for partial tags
    assert.ok(result.score > 0);
    assert.ok(result.data.found?.includes('og:title'));
  });

  it('should detect all required OG tags', () => {
    const html = `
      <html>
        <head>
          <meta property="og:title" content="Test Title">
          <meta property="og:description" content="Test Description">
          <meta property="og:image" content="https://example.com/image.jpg">
          <meta property="og:type" content="website">
          <meta property="og:url" content="https://example.com">
        </head>
      </html>
    `;
    const result = checkOpenGraph(html);

    assert.ok(result.score >= 80);
    assert.ok(result.data.found?.length >= 4);
  });

  it('should warn about non-absolute image URLs', () => {
    const html = `
      <html>
        <head>
          <meta property="og:title" content="Test">
          <meta property="og:image" content="/relative/path.jpg">
        </head>
      </html>
    `;
    const result = checkOpenGraph(html);

    assert.ok(result.warnings?.some((w) => w.includes('absolute')));
  });
});
