/**
 * Tests for FAQ Checker
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { checkFAQBlocks } from '../faq-checker';

describe('checkFAQBlocks', () => {
  it('should return failure when no FAQ patterns found', () => {
    const html = '<html><body>No FAQ here</body></html>';
    const result = checkFAQBlocks(html);

    assert.strictEqual(result.found, false);
    assert.strictEqual(result.score, 0);
  });

  it('should detect FAQPage schema', () => {
    const html = `
      <html>
        <head>
          <script type="application/ld+json">
            {"@type": "FAQPage", "mainEntity": []}
          </script>
        </head>
      </html>
    `;
    const result = checkFAQBlocks(html);

    assert.ok(result.score >= 40);
    assert.strictEqual(result.data.hasFAQSchema, true);
  });

  it('should detect FAQ patterns', () => {
    const html = `
      <html>
        <body>
          <div class="faq-section">
            <div class="faq-item">Q1</div>
          </div>
          <div class="accordion">A1</div>
        </body>
      </html>
    `;
    const result = checkFAQBlocks(html);

    // Multiple patterns should contribute to score
    assert.ok(result.data.patternCount >= 2);
  });
});
