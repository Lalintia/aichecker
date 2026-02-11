/**
 * Tests for Semantic HTML Checker
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { checkSemanticHTML } from '../semantic-html-checker';

describe('checkSemanticHTML', () => {
  it('should return low score for div soup', () => {
    const html = `
      <html>
        <body>
          <div>Header</div>
          <div>Nav</div>
          <div>Content</div>
          <div>Footer</div>
        </body>
      </html>
    `;
    const result = checkSemanticHTML(html);

    assert.ok(result.data.divCount > 0);
    assert.ok(result.score < 70);
  });

  it('should detect semantic elements', () => {
    const html = `
      <html>
        <body>
          <header>Header</header>
          <nav>Navigation</nav>
          <main>
            <article>Content</article>
          </main>
          <footer>Footer</footer>
        </body>
      </html>
    `;
    const result = checkSemanticHTML(html);

    assert.strictEqual(result.found, true);
    assert.ok(result.score >= 70);
    assert.ok(result.data.elementsFound?.includes('header'));
    assert.ok(result.data.elementsFound?.includes('nav'));
    assert.ok(result.data.elementsFound?.includes('main'));
    assert.ok(result.data.elementsFound?.includes('article'));
    assert.ok(result.data.elementsFound?.includes('footer'));
  });

  it('should detect ARIA landmarks', () => {
    const html = `
      <html>
        <body>
          <div role="banner">Header</div>
          <div role="navigation">Nav</div>
          <div role="main">Content</div>
          <div role="contentinfo">Footer</div>
        </body>
      </html>
    `;
    const result = checkSemanticHTML(html);

    assert.strictEqual(result.data.ariaLandmarks?.banner, true);
    assert.strictEqual(result.data.ariaLandmarks?.navigation, true);
    assert.strictEqual(result.data.ariaLandmarks?.main, true);
    assert.strictEqual(result.data.ariaLandmarks?.contentinfo, true);
  });
});
