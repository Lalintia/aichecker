/**
 * Tests for Heading Hierarchy Checker
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { checkHeadingHierarchy } from '../heading-checker';

describe('checkHeadingHierarchy', () => {
  it('should return failure when no headings found', () => {
    const html = '<html><body>No headings here</body></html>';
    const result = checkHeadingHierarchy(html);

    assert.strictEqual(result.found, false);
    assert.strictEqual(result.score, 0);
    assert.ok(result.details.includes('No headings'));
  });

  it('should detect single H1', () => {
    const html = `
      <html>
        <body>
          <h1>Main Title</h1>
          <h2>Section 1</h2>
          <h2>Section 2</h2>
        </body>
      </html>
    `;
    const result = checkHeadingHierarchy(html);

    assert.strictEqual(result.found, true);
    assert.ok(result.score >= 80);
    assert.strictEqual(result.data.h1Count, 1);
    assert.strictEqual(result.data.h2Count, 2);
  });

  it('should warn about multiple H1s', () => {
    const html = `
      <html>
        <body>
          <h1>Title 1</h1>
          <h1>Title 2</h1>
        </body>
      </html>
    `;
    const result = checkHeadingHierarchy(html);

    assert.ok(result.warnings?.some((w) => w.includes('Multiple H1')));
    assert.strictEqual(result.data.h1Count, 2);
  });

  it('should warn about missing H1', () => {
    const html = `
      <html>
        <body>
          <h2>Section</h2>
        </body>
      </html>
    `;
    const result = checkHeadingHierarchy(html);

    assert.ok(result.warnings?.some((w) => w.includes('Missing H1')));
  });

  it('should detect hierarchy violations', () => {
    const html = `
      <html>
        <body>
          <h1>Title</h1>
          <h3>Skipped H2</h3>
        </body>
      </html>
    `;
    const result = checkHeadingHierarchy(html);

    assert.ok(result.data.violations > 0);
  });
});
