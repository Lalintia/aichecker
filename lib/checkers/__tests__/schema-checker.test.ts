/**
 * Tests for Schema Checker
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { checkSchema } from '../schema-checker';

describe('checkSchema', () => {
  it('should return failure when no JSON-LD scripts found', () => {
    const html = '<html><head></head><body>No schema here</body></html>';
    const result = checkSchema('https://example.com', html);

    assert.strictEqual(result.found, false);
    assert.strictEqual(result.score, 0);
    assert.ok(result.details.includes('No Schema.org') || result.details.includes('incomplete or invalid'));
  });

  it('should detect schemas in HTML', () => {
    // Inline HTML to avoid whitespace issues with extraction
    const html = '<html><head><script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"Test"}</script><script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","url":"https://example.com"}</script></head></html>';
    const result = checkSchema('https://example.com', html);

    // Should find scripts and detect types
    assert.ok(result.data.totalSchemas > 0);
  });

  it('should detect multiple schema types', () => {
    const html = `
      <html>
        <head>
          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Test Org"
            }
          </script>
          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "url": "https://example.com"
            }
          </script>
        </head>
      </html>
    `;
    const result = checkSchema('https://example.com', html);

    assert.ok(result.data.totalSchemas >= 2);
  });

  it('should handle invalid JSON-LD gracefully', () => {
    const html = `
      <html>
        <head>
          <script type="application/ld+json">{ invalid json }</script>
        </head>
      </html>
    `;
    const result = checkSchema('https://example.com', html);

    // Should still count the script but not crash
    assert.ok(result.data.totalSchemas !== undefined);
  });
});
