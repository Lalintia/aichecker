/**
 * Tests for Organization and WebSite Schema Validators
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  validateOrganization,
  validateWebSite,
  extractJsonLdScripts,
  findSchemasByType,
  validateOrganizationsInHtml,
  validateWebSitesInHtml,
  validateOrganizationAndWebSite,
  type OrganizationSchema,
  type WebSiteSchema,
} from '../organization-validator';

describe('Organization Validator', () => {
  describe('validateOrganization', () => {
    it('should validate a complete Organization schema with score 100', () => {
      const schema: OrganizationSchema = {
        '@type': 'Organization',
        name: 'Test Organization',
        url: 'https://example.com',
        logo: 'https://example.com/logo.png',
        sameAs: ['https://facebook.com/test', 'https://twitter.com/test'],
        description: 'This is a comprehensive description of the test organization that is well over fifty characters long.',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+1-234-567-8900',
          contactType: 'Customer Service',
        },
        address: {
          '@type': 'PostalAddress',
          streetAddress: '123 Test St',
          addressLocality: 'Test City',
          addressRegion: 'TC',
          postalCode: '12345',
          addressCountry: 'US',
        },
      };

      const result = validateOrganization(schema);

      assert.strictEqual(result.type, 'Organization');
      assert.strictEqual(result.score, 100);
      assert.deepStrictEqual(result.missingRequired, []);
      assert.deepStrictEqual(result.missingRecommended, []);
      assert.deepStrictEqual(result.errors, []);
      assert.ok(result.found.includes('name'));
      assert.ok(result.found.includes('url'));
      assert.ok(result.found.includes('logo'));
      assert.ok(result.found.includes('sameAs'));
      assert.ok(result.found.includes('description'));
      assert.ok(result.found.includes('contactPoint'));
      assert.ok(result.found.includes('address'));
    });

    it('should detect missing required fields', () => {
      const schema: OrganizationSchema = {
        '@type': 'Organization',
        name: 'Test Organization',
        // url is missing
      };

      const result = validateOrganization(schema);

      assert.strictEqual(result.found.includes('url'), false);
      assert.ok(result.missingRequired.includes('url'));
      assert.ok(result.score < 100);
    });

    it('should detect missing recommended fields', () => {
      const schema: OrganizationSchema = {
        '@type': 'Organization',
        name: 'Test Organization',
        url: 'https://example.com',
      };

      const result = validateOrganization(schema);

      assert.deepStrictEqual(result.missingRequired, []);
      assert.ok(result.missingRecommended.includes('logo'));
      assert.ok(result.missingRecommended.includes('sameAs'));
      assert.ok(result.missingRecommended.includes('description'));
      assert.ok(result.missingRecommended.includes('contactPoint'));
      assert.ok(result.missingRecommended.includes('address'));
      assert.ok(result.score < 100);
      assert.ok(result.score >= 50); // Should still get points for required fields
    });

    it('should validate logo as ImageObject', () => {
      const schema: OrganizationSchema = {
        '@type': 'Organization',
        name: 'Test',
        url: 'https://example.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://example.com/logo.png',
        },
      };

      const result = validateOrganization(schema);

      assert.ok(result.found.includes('logo'));
      assert.deepStrictEqual(result.errors, []);
    });

    it('should report error for invalid logo URL', () => {
      const schema: OrganizationSchema = {
        '@type': 'Organization',
        name: 'Test',
        url: 'https://example.com',
        logo: 'not-a-valid-url',
      };

      const result = validateOrganization(schema);

      assert.ok(result.found.includes('logo'));
      assert.ok(result.errors.some((e) => e.includes('logo URL is not valid')));
    });

    it('should report warning for HTTP logo URL', () => {
      const schema: OrganizationSchema = {
        '@type': 'Organization',
        name: 'Test',
        url: 'https://example.com',
        logo: 'http://example.com/logo.png',
      };

      const result = validateOrganization(schema);

      assert.ok(result.found.includes('logo'));
      assert.ok(result.warnings.some((w) => w.includes('HTTP instead of HTTPS')));
    });

    it('should validate sameAs as array', () => {
      const schema: OrganizationSchema = {
        '@type': 'Organization',
        name: 'Test',
        url: 'https://example.com',
        sameAs: ['https://facebook.com/test', 'https://twitter.com/test'],
      };

      const result = validateOrganization(schema);

      assert.ok(result.found.includes('sameAs'));
      assert.deepStrictEqual(result.errors, []);
    });

    it('should validate sameAs as single string', () => {
      const schema: OrganizationSchema = {
        '@type': 'Organization',
        name: 'Test',
        url: 'https://example.com',
        sameAs: 'https://facebook.com/test',
      };

      const result = validateOrganization(schema);

      assert.ok(result.found.includes('sameAs'));
      // Should warn that it should be an array
      assert.ok(result.warnings.some((w) => w.includes('should be an array')));
    });

    it('should report error for invalid sameAs URLs', () => {
      const schema: OrganizationSchema = {
        '@type': 'Organization',
        name: 'Test',
        url: 'https://example.com',
        sameAs: ['https://facebook.com/test', 'not-a-url'],
      };

      const result = validateOrganization(schema);

      assert.ok(result.found.includes('sameAs'));
      assert.ok(result.errors.some((e) => e.includes('sameAs contains invalid URLs')));
    });

    it('should warn for short description', () => {
      const schema: OrganizationSchema = {
        '@type': 'Organization',
        name: 'Test',
        url: 'https://example.com',
        description: 'Short',
      };

      const result = validateOrganization(schema);

      assert.ok(result.found.includes('description'));
      assert.ok(result.warnings.some((w) => w.includes('description is too short')));
    });

    it('should report error for invalid URL', () => {
      const schema: OrganizationSchema = {
        '@type': 'Organization',
        name: 'Test',
        url: 'not-a-valid-url',
      };

      const result = validateOrganization(schema);

      assert.ok(result.found.includes('url'));
      assert.ok(result.errors.some((e) => e.includes('url is not a valid URL')));
    });

    it('should report warning for HTTP URL', () => {
      const schema: OrganizationSchema = {
        '@type': 'Organization',
        name: 'Test',
        url: 'http://example.com',
      };

      const result = validateOrganization(schema);

      assert.ok(result.found.includes('url'));
      assert.ok(result.warnings.some((w) => w.includes('HTTP instead of HTTPS')));
    });

    it('should handle empty organization (no fields)', () => {
      const schema: OrganizationSchema = {
        '@type': 'Organization',
      };

      const result = validateOrganization(schema);

      assert.strictEqual(result.score, 0);
      assert.ok(result.missingRequired.includes('name'));
      assert.ok(result.missingRequired.includes('url'));
    });
  });
});

describe('WebSite Validator', () => {
  describe('validateWebSite', () => {
    it('should validate a complete WebSite schema with score 100', () => {
      const schema: WebSiteSchema = {
        '@type': 'WebSite',
        name: 'Test Website',
        url: 'https://example.com',
        description: 'This is a comprehensive description of the test website that is well over fifty characters long.',
        publisher: {
          '@type': 'Organization',
          name: 'Test Publisher',
        },
        potentialAction: [
          {
            '@type': 'SearchAction',
            target: 'https://example.com/search?q={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        ],
        inLanguage: 'en-US',
      };

      const result = validateWebSite(schema);

      assert.strictEqual(result.type, 'WebSite');
      assert.strictEqual(result.score, 100);
      assert.deepStrictEqual(result.missingRequired, []);
      assert.deepStrictEqual(result.missingRecommended, []);
      assert.ok(result.found.includes('name'));
      assert.ok(result.found.includes('url'));
      assert.ok(result.found.includes('description'));
      assert.ok(result.found.includes('publisher'));
      assert.ok(result.found.includes('potentialAction'));
      assert.ok(result.found.includes('inLanguage'));
    });

    it('should detect missing required fields', () => {
      const schema: WebSiteSchema = {
        '@type': 'WebSite',
        name: 'Test Website',
        // url is missing
      };

      const result = validateWebSite(schema);

      assert.ok(result.missingRequired.includes('url'));
      assert.ok(result.score < 100);
    });

    it('should detect missing recommended fields', () => {
      const schema: WebSiteSchema = {
        '@type': 'WebSite',
        name: 'Test Website',
        url: 'https://example.com',
      };

      const result = validateWebSite(schema);

      assert.deepStrictEqual(result.missingRequired, []);
      assert.ok(result.missingRecommended.includes('description'));
      assert.ok(result.missingRecommended.includes('publisher'));
      assert.ok(result.missingRecommended.includes('potentialAction'));
      assert.ok(result.missingRecommended.includes('inLanguage'));
    });

    it('should warn for short description', () => {
      const schema: WebSiteSchema = {
        '@type': 'WebSite',
        name: 'Test',
        url: 'https://example.com',
        description: 'Short',
      };

      const result = validateWebSite(schema);

      assert.ok(result.found.includes('description'));
      assert.ok(result.warnings.some((w) => w.includes('description is too short')));
    });

    it('should validate publisher as Organization object', () => {
      const schema: WebSiteSchema = {
        '@type': 'WebSite',
        name: 'Test',
        url: 'https://example.com',
        publisher: {
          '@type': 'Organization',
          name: 'Test Publisher',
        },
      };

      const result = validateWebSite(schema);

      assert.ok(result.found.includes('publisher'));
      assert.deepStrictEqual(result.errors, []);
    });

    it('should warn if publisher has wrong @type', () => {
      const schema: WebSiteSchema = {
        '@type': 'WebSite',
        name: 'Test',
        url: 'https://example.com',
        publisher: {
          '@type': 'Person',
          name: 'Test Person',
        },
      };

      const result = validateWebSite(schema);

      assert.ok(result.found.includes('publisher'));
      assert.ok(result.warnings.some((w) => w.includes('should be "Organization"')));
    });

    it('should validate potentialAction with SearchAction', () => {
      const schema: WebSiteSchema = {
        '@type': 'WebSite',
        name: 'Test',
        url: 'https://example.com',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://example.com/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      };

      const result = validateWebSite(schema);

      assert.ok(result.found.includes('potentialAction'));
      // Should not warn about missing SearchAction
      assert.ok(!result.warnings.some((w) => w.includes('SearchAction')));
    });

    it('should warn if no SearchAction in potentialAction', () => {
      const schema: WebSiteSchema = {
        '@type': 'WebSite',
        name: 'Test',
        url: 'https://example.com',
        potentialAction: {
          '@type': 'ReadAction',
          target: 'https://example.com/read',
        },
      };

      const result = validateWebSite(schema);

      assert.ok(result.found.includes('potentialAction'));
      assert.ok(result.warnings.some((w) => w.includes('SearchAction')));
    });

    it('should validate inLanguage format', () => {
      const schema: WebSiteSchema = {
        '@type': 'WebSite',
        name: 'Test',
        url: 'https://example.com',
        inLanguage: 'en-US',
      };

      const result = validateWebSite(schema);

      assert.ok(result.found.includes('inLanguage'));
      // Valid BCP 47 tag should not generate warning
      assert.ok(!result.warnings.some((w) => w.includes('inLanguage')));
    });

    it('should warn for invalid inLanguage format', () => {
      const schema: WebSiteSchema = {
        '@type': 'WebSite',
        name: 'Test',
        url: 'https://example.com',
        inLanguage: 'english',
      };

      const result = validateWebSite(schema);

      assert.ok(result.found.includes('inLanguage'));
      assert.ok(result.warnings.some((w) => w.includes('inLanguage')));
      assert.ok(result.warnings.some((w) => w.includes('BCP 47')));
    });
  });
});

describe('JSON-LD Parser', () => {
  describe('extractJsonLdScripts', () => {
    it('should extract JSON-LD scripts from HTML', () => {
      const html = `
        <html>
          <head>
            <script type="application/ld+json">
              {"@type": "Organization", "name": "Test"}
            </script>
          </head>
        </html>
      `;

      const scripts = extractJsonLdScripts(html);

      assert.strictEqual(scripts.length, 1);
      assert.strictEqual((scripts[0] as { '@type': string })['@type'], 'Organization');
    });

    it('should extract multiple JSON-LD scripts', () => {
      const html = `
        <html>
          <head>
            <script type="application/ld+json">
              {"@type": "Organization", "name": "Test Org"}
            </script>
            <script type="application/ld+json">
              {"@type": "WebSite", "name": "Test Site"}
            </script>
          </head>
        </html>
      `;

      const scripts = extractJsonLdScripts(html);

      assert.strictEqual(scripts.length, 2);
    });

    it('should skip invalid JSON', () => {
      const html = `
        <html>
          <head>
            <script type="application/ld+json">
              { invalid json }
            </script>
            <script type="application/ld+json">
              {"@type": "Organization", "name": "Test"}
            </script>
          </head>
        </html>
      `;

      const scripts = extractJsonLdScripts(html);

      assert.strictEqual(scripts.length, 1);
    });

    it('should handle empty HTML', () => {
      const scripts = extractJsonLdScripts('');
      assert.strictEqual(scripts.length, 0);
    });

    it('should handle HTML without JSON-LD', () => {
      const html = '<html><head></head><body>No schema here</body></html>';
      const scripts = extractJsonLdScripts(html);
      assert.strictEqual(scripts.length, 0);
    });
  });

  describe('findSchemasByType', () => {
    it('should find schemas by type', () => {
      const scripts = [
        { '@type': 'Organization', name: 'Test Org' },
        { '@type': 'WebSite', name: 'Test Site' },
        { '@type': 'Organization', name: 'Another Org' },
      ];

      const orgs = findSchemasByType(scripts, 'Organization');

      assert.strictEqual(orgs.length, 2);
    });

    it('should handle @graph array', () => {
      const scripts = [
        {
          '@context': 'https://schema.org',
          '@graph': [
            { '@type': 'Organization', name: 'Test Org' },
            { '@type': 'WebSite', name: 'Test Site' },
          ],
        },
      ];

      const websites = findSchemasByType(scripts, 'WebSite');

      assert.strictEqual(websites.length, 1);
    });

    it('should handle array @type', () => {
      const scripts = [
        { '@type': ['Organization', 'LocalBusiness'], name: 'Test' },
      ];

      const orgs = findSchemasByType(scripts, 'Organization');
      const businesses = findSchemasByType(scripts, 'LocalBusiness');

      assert.strictEqual(orgs.length, 1);
      assert.strictEqual(businesses.length, 1);
    });
  });
});

describe('HTML Validation', () => {
  describe('validateOrganizationsInHtml', () => {
    it('should find and validate Organization in HTML', () => {
      const html = `
        <html>
          <head>
            <script type="application/ld+json">
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Test Organization",
                "url": "https://example.com",
                "logo": "https://example.com/logo.png"
              }
            </script>
          </head>
        </html>
      `;

      const result = validateOrganizationsInHtml(html);

      assert.strictEqual(result.found, true);
      assert.strictEqual(result.organizations.length, 1);
      assert.strictEqual(result.organizations[0].type, 'Organization');
      assert.ok(result.organizations[0].found.includes('name'));
      assert.ok(result.organizations[0].found.includes('url'));
    });

    it('should return not found when no Organization exists', () => {
      const html = '<html><head></head><body>No schema</body></html>';
      const result = validateOrganizationsInHtml(html);

      assert.strictEqual(result.found, false);
      assert.strictEqual(result.organizations.length, 0);
    });
  });

  describe('validateWebSitesInHtml', () => {
    it('should find and validate WebSite in HTML', () => {
      const html = `
        <html>
          <head>
            <script type="application/ld+json">
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Test Website",
                "url": "https://example.com"
              }
            </script>
          </head>
        </html>
      `;

      const result = validateWebSitesInHtml(html);

      assert.strictEqual(result.found, true);
      assert.strictEqual(result.websites.length, 1);
      assert.strictEqual(result.websites[0].type, 'WebSite');
    });

    it('should return not found when no WebSite exists', () => {
      const html = '<html><head></head><body>No schema</body></html>';
      const result = validateWebSitesInHtml(html);

      assert.strictEqual(result.found, false);
      assert.strictEqual(result.websites.length, 0);
    });
  });

  describe('validateOrganizationAndWebSite', () => {
    it('should validate both Organization and WebSite', () => {
      const html = `
        <html>
          <head>
            <script type="application/ld+json">
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Test Organization",
                "url": "https://example.com"
              }
            </script>
            <script type="application/ld+json">
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Test Website",
                "url": "https://example.com"
              }
            </script>
          </head>
        </html>
      `;

      const result = validateOrganizationAndWebSite(extractJsonLdScripts(html));

      assert.strictEqual(result.organization.found, true);
      assert.strictEqual(result.website.found, true);
      assert.strictEqual(result.organization.results.length, 1);
      assert.strictEqual(result.website.results.length, 1);
      assert.ok(result.organization.bestScore > 0);
      assert.ok(result.website.bestScore > 0);
    });

    it('should handle missing schemas gracefully', () => {
      const html = '<html><head></head><body>No schema</body></html>';
      const result = validateOrganizationAndWebSite(extractJsonLdScripts(html));

      assert.strictEqual(result.organization.found, false);
      assert.strictEqual(result.website.found, false);
      assert.strictEqual(result.organization.bestScore, 0);
      assert.strictEqual(result.website.bestScore, 0);
    });

    it('should return best score when multiple schemas exist', () => {
      const html = `
        <html>
          <head>
            <script type="application/ld+json">
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Incomplete Org"
              }
            </script>
            <script type="application/ld+json">
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Complete Org",
                "url": "https://example.com",
                "logo": "https://example.com/logo.png",
                "sameAs": ["https://facebook.com/test"]
              }
            </script>
          </head>
        </html>
      `;

      const result = validateOrganizationAndWebSite(extractJsonLdScripts(html));

      assert.strictEqual(result.organization.results.length, 2);
      // Best score should be from the complete org
      assert.ok(result.organization.bestScore > 50);
    });
  });
});
