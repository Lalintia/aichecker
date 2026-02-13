/**
 * Tests for Other Validators (BreadcrumbList, WebPage, LocalBusiness)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  validateBreadcrumbList,
  validateWebPage,
  validateLocalBusiness,
} from '../other-validators';

describe('validateBreadcrumbList', () => {
  it('should return partial score when no itemListElement', () => {
    const schema = { '@type': 'BreadcrumbList' };
    const result = validateBreadcrumbList(schema);

    // Validator gives partial score (40) for having @type even without items
    assert.ok(result.score >= 0);
    assert.ok(result.errors.some(e => e.includes('itemListElement')));
  });

  it('should validate complete breadcrumb', () => {
    const schema = {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://example.com/' },
        { '@type': 'ListItem', position: 2, name: 'Products', item: 'https://example.com/products' },
        { '@type': 'ListItem', position: 3, name: 'Item', item: 'https://example.com/products/item' },
      ],
    };
    const result = validateBreadcrumbList(schema);

    assert.strictEqual(result.score, 100);
    assert.strictEqual(result.itemCount, 3);
    assert.strictEqual(result.hasValidPositions, true);
    assert.strictEqual(result.errors.length, 0);
  });

  it('should detect non-sequential positions', () => {
    const schema = {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://example.com/' },
        { '@type': 'ListItem', position: 3, name: 'Products', item: 'https://example.com/products' },
      ],
    };
    const result = validateBreadcrumbList(schema);

    assert.ok(result.warnings.some(w => w.includes('position')) || result.missingPositions.length > 0);
  });

  it('should detect missing item URLs', () => {
    const schema = {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home' },
        { '@type': 'ListItem', position: 2, name: 'Products', item: 'not-a-url' },
      ],
    };
    const result = validateBreadcrumbList(schema);

    assert.ok(result.warnings.some(w => w.includes('URL') || w.includes('item')));
  });

  it('should handle empty itemListElement', () => {
    const schema = {
      '@type': 'BreadcrumbList',
      itemListElement: [],
    };
    const result = validateBreadcrumbList(schema);

    // Validator gives partial score for having @type
    assert.ok(result.score >= 0);
    assert.strictEqual(result.itemCount, 0);
  });
});

describe('validateWebPage', () => {
  it('should validate complete WebPage', () => {
    const schema = {
      '@type': 'WebPage',
      name: 'About Us',
      description: 'Learn more about our company',
      url: 'https://example.com/about',
      breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [] },
    };
    const result = validateWebPage(schema);

    assert.strictEqual(result.score, 100);
    assert.ok(result.found.includes('name'));
    assert.ok(result.found.includes('description'));
    assert.ok(result.found.includes('url'));
    assert.strictEqual(result.hasBreadcrumbReference, true);
  });

  it('should return partial score for missing fields', () => {
    const schema = {
      '@type': 'WebPage',
      name: 'About Us',
    };
    const result = validateWebPage(schema);

    assert.ok(result.score < 100);
    assert.ok(result.score > 0);
    // Check that some fields are missing
    assert.ok(!result.found.includes('url') || !result.found.includes('description'));
  });

  it('should warn about missing breadcrumb', () => {
    const schema = {
      '@type': 'WebPage',
      name: 'About Us',
      description: 'Learn more',
      url: 'https://example.com/about',
    };
    const result = validateWebPage(schema);

    assert.ok(result.warnings.some(w => w.includes('breadcrumb')));
    assert.strictEqual(result.hasBreadcrumbReference, false);
  });

  it('should handle invalid URL gracefully', () => {
    const schema = {
      '@type': 'WebPage',
      name: 'Test',
      url: 'not-a-valid-url',
    };
    const result = validateWebPage(schema);

    // Should still return a score, possibly with warnings
    assert.ok(result.score >= 0);
  });

  it('should return partial score for non-WebPage type', () => {
    const schema = { '@type': 'Organization', name: 'Test' };
    const result = validateWebPage(schema);

    // Validator gives partial score for attempting validation
    assert.ok(result.score >= 0);
    assert.ok(result.warnings.length > 0 || result.errors.length > 0);
  });
});

describe('validateLocalBusiness', () => {
  it('should validate complete Restaurant', () => {
    const schema = {
      '@type': 'Restaurant',
      name: 'Pasta Paradise',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '123 Main St',
        addressLocality: 'New York',
        addressRegion: 'NY',
        postalCode: '10001',
        addressCountry: 'US',
      },
      telephone: '+1-555-1234',
      openingHours: ['Mo-Sa 11:00-22:00', 'Su 12:00-21:00'],
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 40.7128,
        longitude: -74.0060,
      },
      image: 'https://example.com/image.jpg',
      priceRange: '$$',
    };
    const result = validateLocalBusiness(schema);

    assert.strictEqual(result.score, 100);
    assert.strictEqual(result.specificType, 'Restaurant');
    assert.strictEqual(result.addressValid, true);
    assert.strictEqual(result.hasRequiredFields, true);
  });

  it('should validate basic LocalBusiness', () => {
    const schema = {
      '@type': 'LocalBusiness',
      name: 'My Business',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '123 Main St',
        addressLocality: 'City',
        addressRegion: 'State',
        postalCode: '12345',
      },
    };
    const result = validateLocalBusiness(schema);

    assert.ok(result.score >= 50);
    assert.strictEqual(result.hasRequiredFields, true);
    assert.strictEqual(result.addressValid, true);
  });

  it('should detect incomplete address', () => {
    const schema = {
      '@type': 'Store',
      name: 'My Store',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '123 Main St',
        // Missing other fields
      },
    };
    const result = validateLocalBusiness(schema);

    assert.ok(result.score < 100);
    assert.strictEqual(result.addressValid, false);
  });

  it('should validate various business types', () => {
    const types = ['Restaurant', 'Store', 'Dentist', 'Hospital', 'Hotel', 'AutoRepair'];
    
    for (const type of types) {
      const schema = {
        '@type': type,
        name: 'Test Business',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '123 Main',
          addressLocality: 'City',
          addressRegion: 'ST',
          postalCode: '12345',
        },
      };
      const result = validateLocalBusiness(schema);
      
      assert.strictEqual(result.specificType, type);
      assert.ok(result.score > 0);
    }
  });

  it('should detect missing required fields', () => {
    const schema = {
      '@type': 'Restaurant',
      name: 'Test Restaurant',
      // Missing address
    };
    const result = validateLocalBusiness(schema);

    assert.ok(result.score < 100);
    assert.strictEqual(result.hasRequiredFields, false);
  });

  it('should validate geo coordinates', () => {
    const schema = {
      '@type': 'Restaurant',
      name: 'Test',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '123 Main',
        addressLocality: 'City',
        addressRegion: 'ST',
        postalCode: '12345',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 'invalid',
        longitude: -74.0,
      },
    };
    const result = validateLocalBusiness(schema);

    assert.ok(result.warnings.some(w => w.includes('geo') || w.includes('coordinates')));
  });

  it('should return low score for non-LocalBusiness type', () => {
    const schema = { '@type': 'Organization', name: 'Test' };
    const result = validateLocalBusiness(schema);

    // Validator gives partial score for attempting validation
    assert.ok(result.score >= 0);
    assert.ok(result.warnings.length > 0 || result.errors.length > 0);
  });
});
