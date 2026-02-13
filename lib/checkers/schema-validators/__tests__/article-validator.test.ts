/**
 * Tests for Article Schema Validator
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  validateArticleSchema,
  validateArticleSchemas,
  extractJsonLdScripts,
  extractArticleSchemas,
  isArticleSchema,
  getArticleRecommendations,
  type ArticleSchema,
} from '../article-validator';

describe('extractJsonLdScripts', () => {
  it('should extract JSON-LD scripts from HTML', () => {
    const html = `
      <html>
        <head>
          <script type="application/ld+json">
            {"@type": "Article", "headline": "Test"}
          </script>
        </head>
      </html>
    `;
    const scripts = extractJsonLdScripts(html);
    assert.strictEqual(scripts.length, 1);
    assert.ok(scripts[0].includes('"@type": "Article"'));
  });

  it('should extract multiple JSON-LD scripts', () => {
    const html = `
      <html>
        <head>
          <script type="application/ld+json">{"@type": "Organization"}</script>
          <script type="application/ld+json">{"@type": "Article"}</script>
        </head>
      </html>
    `;
    const scripts = extractJsonLdScripts(html);
    assert.strictEqual(scripts.length, 2);
  });

  it('should return empty array when no JSON-LD scripts', () => {
    const html = '<html><head></head></html>';
    const scripts = extractJsonLdScripts(html);
    assert.strictEqual(scripts.length, 0);
  });
});

describe('isArticleSchema', () => {
  it('should return true for Article type', () => {
    assert.strictEqual(isArticleSchema({ '@type': 'Article' }), true);
  });

  it('should return true for BlogPosting type', () => {
    assert.strictEqual(isArticleSchema({ '@type': 'BlogPosting' }), true);
  });

  it('should return true for NewsArticle type', () => {
    assert.strictEqual(isArticleSchema({ '@type': 'NewsArticle' }), true);
  });

  it('should return true for array type containing Article', () => {
    assert.strictEqual(isArticleSchema({ '@type': ['Article', 'CreativeWork'] }), true);
  });

  it('should return false for non-article types', () => {
    assert.strictEqual(isArticleSchema({ '@type': 'Organization' }), false);
    assert.strictEqual(isArticleSchema({ '@type': 'WebSite' }), false);
  });
});

describe('extractArticleSchemas', () => {
  it('should extract Article schemas from JSON-LD scripts', () => {
    const scripts = [
      '{"@type": "Article", "headline": "Test Article"}',
      '{"@type": "Organization", "name": "Test Org"}',
    ];
    const articles = extractArticleSchemas(scripts);
    assert.strictEqual(articles.length, 1);
    assert.strictEqual(articles[0].headline, 'Test Article');
  });

  it('should handle array of schemas in single script', () => {
    const scripts = [
      '[{"@type": "Article"}, {"@type": "BlogPosting"}]',
    ];
    const articles = extractArticleSchemas(scripts);
    assert.strictEqual(articles.length, 2);
  });

  it('should skip invalid JSON', () => {
    const scripts = [
      '{"@type": "Article", "headline": "Valid"}',
      'invalid json',
      '{"@type": "BlogPosting", "headline": "Also Valid"}',
    ];
    const articles = extractArticleSchemas(scripts);
    assert.strictEqual(articles.length, 2);
  });
});

describe('validateArticleSchema', () => {
  const validArticle: ArticleSchema = {
    '@type': 'Article',
    headline: 'Test Article',
    author: {
      '@type': 'Person',
      name: 'John Doe',
    },
    datePublished: '2024-01-15T10:00:00Z',
    publisher: {
      '@type': 'Organization',
      name: 'Test Publisher',
    },
    description: 'A test article',
    image: 'https://example.com/image.jpg',
    dateModified: '2024-01-16T10:00:00Z',
    articleSection: 'Technology',
    keywords: 'test, article, schema',
  };

  it('should validate a complete article with high score', () => {
    const result = validateArticleSchema(validArticle);
    assert.ok(result.score >= 90);
    assert.strictEqual(result.missingRequired.length, 0);
    assert.strictEqual(result.errors.length, 0);
  });

  it('should detect missing required fields', () => {
    const incompleteArticle: ArticleSchema = {
      '@type': 'Article',
      headline: 'Test',
    };
    const result = validateArticleSchema(incompleteArticle);
    assert.ok(result.missingRequired.includes('author'));
    assert.ok(result.missingRequired.includes('datePublished'));
    assert.ok(result.missingRequired.includes('publisher'));
    assert.ok(result.score < 50);
  });

  it('should detect missing recommended fields', () => {
    const minimalArticle: ArticleSchema = {
      '@type': 'Article',
      headline: 'Test',
      author: { '@type': 'Person', name: 'John' },
      datePublished: '2024-01-15',
      publisher: { '@type': 'Organization', name: 'Pub' },
    };
    const result = validateArticleSchema(minimalArticle);
    assert.ok(result.missingRecommended.includes('dateModified'));
    assert.ok(result.missingRecommended.includes('description'));
    assert.ok(result.missingRecommended.includes('image'));
  });

  it('should validate author as Organization', () => {
    const article: ArticleSchema = {
      ...validArticle,
      author: {
        '@type': 'Organization',
        name: 'Test Org',
      },
    };
    const result = validateArticleSchema(article);
    assert.ok(!result.errors.includes('author.@type should be "Person" or "Organization"'));
  });

  it('should detect invalid author type', () => {
    const article: ArticleSchema = {
      ...validArticle,
      author: {
        '@type': 'InvalidType',
        name: 'Test',
      },
    };
    const result = validateArticleSchema(article);
    assert.ok(result.errors.some((e) => e.includes('author.@type')));
  });

  it('should detect missing author name', () => {
    const article: ArticleSchema = {
      ...validArticle,
      author: {
        '@type': 'Person',
      },
    };
    const result = validateArticleSchema(article);
    assert.ok(result.errors.includes('author.name is missing'));
  });

  it('should validate author array', () => {
    const article: ArticleSchema = {
      ...validArticle,
      author: [
        { '@type': 'Person', name: 'Author 1' },
        { '@type': 'Person', name: 'Author 2' },
      ],
    };
    const result = validateArticleSchema(article);
    assert.ok(result.found.includes('author'));
  });

  it('should warn about non-ISO date format', () => {
    const article: ArticleSchema = {
      ...validArticle,
      datePublished: 'January 15, 2024',
    };
    const result = validateArticleSchema(article);
    assert.ok(result.warnings.some((w) => w.includes('ISO 8601')));
  });

  it('should detect invalid date', () => {
    const article: ArticleSchema = {
      ...validArticle,
      datePublished: 'invalid-date',
    };
    const result = validateArticleSchema(article);
    assert.ok(result.errors.includes('datePublished is not a valid date'));
  });

  it('should validate image as string URL', () => {
    const article: ArticleSchema = {
      ...validArticle,
      image: 'https://example.com/image.jpg',
    };
    const result = validateArticleSchema(article);
    assert.ok(result.found.includes('image'));
  });

  it('should validate image as ImageObject', () => {
    const article: ArticleSchema = {
      ...validArticle,
      image: {
        '@type': 'ImageObject',
        url: 'https://example.com/image.jpg',
      },
    };
    const result = validateArticleSchema(article);
    assert.ok(result.found.includes('image'));
  });

  it('should validate image array', () => {
    const article: ArticleSchema = {
      ...validArticle,
      image: [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
      ],
    };
    const result = validateArticleSchema(article);
    assert.ok(result.found.includes('image'));
  });

  it('should detect missing publisher name', () => {
    const article: ArticleSchema = {
      ...validArticle,
      publisher: {
        '@type': 'Organization',
      },
    };
    const result = validateArticleSchema(article);
    assert.ok(result.errors.includes('publisher.name is missing'));
  });

  it('should detect headline exceeding 110 characters', () => {
    const article: ArticleSchema = {
      ...validArticle,
      headline: 'A'.repeat(120),
    };
    const result = validateArticleSchema(article);
    assert.ok(result.errors.some((e) => e.includes('headline exceeds')));
  });

  it('should accept name as alternative to headline', () => {
    const article: ArticleSchema = {
      ...validArticle,
      headline: undefined,
      name: 'Test Article Name',
    };
    const result = validateArticleSchema(article);
    assert.ok(result.found.includes('headline'));
  });

  it('should validate keywords as string', () => {
    const article: ArticleSchema = {
      ...validArticle,
      keywords: 'keyword1, keyword2, keyword3',
    };
    const result = validateArticleSchema(article);
    assert.ok(result.found.includes('keywords'));
  });

  it('should validate keywords as array', () => {
    const article: ArticleSchema = {
      ...validArticle,
      keywords: ['keyword1', 'keyword2'],
    };
    const result = validateArticleSchema(article);
    assert.ok(result.found.includes('keywords'));
  });

  it('should correctly identify BlogPosting type', () => {
    const article: ArticleSchema = {
      ...validArticle,
      '@type': 'BlogPosting',
    };
    const result = validateArticleSchema(article);
    assert.strictEqual(result.type, 'BlogPosting');
  });

  it('should correctly identify NewsArticle type', () => {
    const article: ArticleSchema = {
      ...validArticle,
      '@type': 'NewsArticle',
    };
    const result = validateArticleSchema(article);
    assert.strictEqual(result.type, 'NewsArticle');
  });
});

describe('validateArticleSchemas', () => {
  it('should return not found when no JSON-LD', () => {
    const html = '<html></html>';
    const result = validateArticleSchemas(html);
    assert.strictEqual(result.found, false);
    assert.ok(result.errors.includes('No JSON-LD scripts found'));
  });

  it('should return not found when no article schemas', () => {
    const html = `
      <html>
        <script type="application/ld+json">
          {"@type": "Organization", "name": "Test"}
        </script>
      </html>
    `;
    const result = validateArticleSchemas(html);
    assert.strictEqual(result.found, false);
    assert.ok(result.errors.includes('No Article, BlogPosting, or NewsArticle schema found'));
  });

  it('should validate article in HTML', () => {
    const html = `
      <html>
        <script type="application/ld+json">
          {
            "@type": "Article",
            "headline": "Test Article",
            "author": {"@type": "Person", "name": "John"},
            "datePublished": "2024-01-15T10:00:00Z",
            "publisher": {"@type": "Organization", "name": "Pub"}
          }
        </script>
      </html>
    `;
    const result = validateArticleSchemas(html);
    assert.strictEqual(result.found, true);
    assert.strictEqual(result.articles.length, 1);
    assert.strictEqual(result.articles[0].type, 'Article');
  });

  it('should calculate average score for multiple articles', () => {
    const html = `
      <html>
        <script type="application/ld+json">
          [
            {"@type": "Article", "headline": "Article 1", "author": {"@type": "Person", "name": "John"}, "datePublished": "2024-01-15", "publisher": {"@type": "Organization", "name": "Pub"}},
            {"@type": "BlogPosting", "headline": "Article 2", "author": {"@type": "Person", "name": "Jane"}, "datePublished": "2024-01-16", "publisher": {"@type": "Organization", "name": "Pub"}}
          ]
        </script>
      </html>
    `;
    const result = validateArticleSchemas(html);
    assert.strictEqual(result.articles.length, 2);
    assert.ok(result.totalScore > 0);
  });
});

describe('getArticleRecommendations', () => {
  it('should recommend adding article schema when not found', () => {
    const result = {
      found: false,
      articles: [],
      totalScore: 0,
      errors: ['No JSON-LD scripts found'],
      warnings: [],
    };
    const recommendations = getArticleRecommendations(result);
    assert.ok(recommendations.includes('Add Article, BlogPosting, or NewsArticle schema to your page'));
  });

  it('should recommend missing required fields', () => {
    const result = {
      found: true,
      articles: [{
        type: 'Article' as const,
        score: 50,
        found: ['headline'],
        missingRequired: ['author', 'publisher'],
        missingRecommended: [],
        errors: [],
        warnings: [],
      }],
      totalScore: 50,
      errors: [],
      warnings: [],
    };
    const recommendations = getArticleRecommendations(result);
    assert.ok(recommendations.some((r) => r.includes('author')));
    assert.ok(recommendations.some((r) => r.includes('publisher')));
  });

  it('should recommend fixing author type', () => {
    const result = {
      found: true,
      articles: [{
        type: 'Article' as const,
        score: 70,
        found: ['headline', 'author', 'datePublished', 'publisher'],
        missingRequired: [],
        missingRecommended: [],
        errors: ['author.@type should be "Person" or "Organization", got "Invalid"'],
        warnings: [],
      }],
      totalScore: 70,
      errors: ['author.@type should be "Person" or "Organization", got "Invalid"'],
      warnings: [],
    };
    const recommendations = getArticleRecommendations(result);
    assert.ok(recommendations.includes('Set author.@type to "Person" or "Organization"'));
  });

  it('should recommend ISO 8601 format for dates', () => {
    const result = {
      found: true,
      articles: [{
        type: 'Article' as const,
        score: 80,
        found: ['headline', 'author', 'datePublished', 'publisher'],
        missingRequired: [],
        missingRecommended: [],
        errors: [],
        warnings: ['datePublished is not in ISO 8601 format'],
      }],
      totalScore: 80,
      errors: [],
      warnings: ['datePublished is not in ISO 8601 format'],
    };
    const recommendations = getArticleRecommendations(result);
    assert.ok(recommendations.some((r) => r.includes('ISO 8601')));
  });
});
