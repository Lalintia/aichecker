/**
 * Article Schema Validator
 * Validates Article, BlogPosting, and NewsArticle structured data
 * Per Google Search Central guidelines
 */

import { extractRawJsonLdScripts } from './jsonld-utils';

// Article schema types
export type ArticleSchemaType = 'Article' | 'BlogPosting' | 'NewsArticle';

// Valid author types
export type AuthorType = 'Person' | 'Organization';

// Publisher type
export interface Publisher {
  readonly '@type'?: string;
  readonly name?: string;
  readonly logo?: string | { readonly '@type'?: string; readonly url?: string };
}

// Author type
export interface Author {
  readonly '@type'?: string;
  readonly name?: string;
  readonly url?: string;
  readonly jobTitle?: string;
  readonly worksFor?: string | Publisher;
}

// Image type - can be string URL or ImageObject
export type ImageType = string | { readonly '@type'?: string; readonly url?: string };

// Article schema structure
export interface ArticleSchema {
  readonly '@type'?: string | readonly string[];
  readonly headline?: string;
  readonly name?: string; // Alternative for headline
  readonly author?: Author | Author[] | string;
  readonly datePublished?: string;
  readonly dateModified?: string;
  readonly publisher?: Publisher | string;
  readonly description?: string;
  readonly image?: ImageType | ImageType[];
  readonly articleSection?: string;
  readonly keywords?: string | readonly string[];
  readonly articleBody?: string;
  readonly wordCount?: number;
  readonly mainEntityOfPage?: string | { readonly '@type'?: string; readonly '@id'?: string };
  readonly url?: string;
  readonly inLanguage?: string;
}

// Validation result for a single article schema
export interface ArticleValidationResult {
  readonly type: ArticleSchemaType;
  readonly score: number;
  readonly found: readonly string[];
  readonly missingRequired: readonly string[];
  readonly missingRecommended: readonly string[];
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

// Overall validation result
export interface ArticleValidatorResult {
  readonly found: boolean;
  readonly articles: readonly ArticleValidationResult[];
  readonly totalScore: number;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

// Required fields per Google Search Central
const REQUIRED_FIELDS: readonly string[] = ['headline', 'author', 'datePublished', 'publisher'];

// Recommended fields for better SEO and AI understanding
const RECOMMENDED_FIELDS: readonly string[] = [
  'dateModified',
  'description',
  'image',
  'articleSection',
  'keywords',
];

// ISO 8601 date regex pattern
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})?)?$/;

/**
 * Check if a value is a non-empty string
 */
function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Check if a value is a valid object
 */
function isValidObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Get the headline value from schema (headline or name)
 */
function getHeadline(schema: ArticleSchema): string | undefined {
  if (isNonEmptyString(schema.headline)) {
    return schema.headline;
  }
  if (isNonEmptyString(schema.name)) {
    return schema.name;
  }
  return undefined;
}

/**
 * Validate author field
 * Returns array of error messages
 */
function validateAuthor(author: unknown): string[] {
  const errors: string[] = [];

  if (author === undefined || author === null) {
    errors.push('author is missing');
    return errors;
  }

  // If string, just check it's not empty
  if (typeof author === 'string') {
    if (author.trim().length === 0) {
      errors.push('author cannot be empty string');
    }
    return errors;
  }

  // Handle array of authors
  if (Array.isArray(author)) {
    if (author.length === 0) {
      errors.push('author array is empty');
      return errors;
    }
    // Validate first author
    const firstAuthor = author[0];
    if (isValidObject(firstAuthor)) {
      if (!isNonEmptyString(firstAuthor.name)) {
        errors.push('author[0].name is missing');
      }
      if (!isNonEmptyString(firstAuthor['@type'])) {
        errors.push('author[0].@type is missing (should be "Person" or "Organization")');
      } else if (!['Person', 'Organization'].includes(firstAuthor['@type'])) {
        errors.push(`author[0].@type should be "Person" or "Organization", got "${firstAuthor['@type']}"`);
      }
    }
    return errors;
  }

  // Handle single author object
  if (isValidObject(author)) {
    if (!isNonEmptyString(author.name)) {
      errors.push('author.name is missing');
    }
    if (!isNonEmptyString(author['@type'])) {
      errors.push('author.@type is missing (should be "Person" or "Organization")');
    } else if (!['Person', 'Organization'].includes(author['@type'])) {
      errors.push(`author.@type should be "Person" or "Organization", got "${author['@type']}"`);
    }
    return errors;
  }

  errors.push('author has invalid type');
  return errors;
}

/**
 * Validate publisher field
 */
function validatePublisher(publisher: unknown): string[] {
  const errors: string[] = [];

  if (publisher === undefined || publisher === null) {
    errors.push('publisher is missing');
    return errors;
  }

  // If string, just check it's not empty
  if (typeof publisher === 'string') {
    if (publisher.trim().length === 0) {
      errors.push('publisher cannot be empty string');
    }
    return errors;
  }

  // Handle publisher object
  if (isValidObject(publisher)) {
    if (!isNonEmptyString(publisher.name)) {
      errors.push('publisher.name is missing');
    }
    return errors;
  }

  errors.push('publisher has invalid type');
  return errors;
}

/**
 * Validate date field (datePublished or dateModified)
 */
function validateDate(dateValue: unknown, fieldName: string): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (dateValue === undefined || dateValue === null) {
    errors.push(`${fieldName} is missing`);
    return { errors, warnings };
  }

  if (!isNonEmptyString(dateValue)) {
    errors.push(`${fieldName} must be a string`);
    return { errors, warnings };
  }

  // Check ISO 8601 format
  if (!ISO_DATE_REGEX.test(dateValue)) {
    warnings.push(`${fieldName} is not in ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ)`);
  }

  // Check if it's a valid date
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) {
    errors.push(`${fieldName} is not a valid date`);
  }

  return { errors, warnings };
}

/**
 * Validate image field
 */
function validateImage(image: unknown): string[] {
  const errors: string[] = [];

  if (image === undefined || image === null) {
    errors.push('image is missing');
    return errors;
  }

  // Handle string URL
  if (typeof image === 'string') {
    if (image.trim().length === 0) {
      errors.push('image URL cannot be empty');
    }
    return errors;
  }

  // Handle array of images
  if (Array.isArray(image)) {
    if (image.length === 0) {
      errors.push('image array is empty');
      return errors;
    }
    // Validate first image
    const firstImage = image[0];
    if (typeof firstImage === 'string') {
      if (firstImage.trim().length === 0) {
        errors.push('image[0] URL cannot be empty');
      }
    } else if (isValidObject(firstImage)) {
      if (!isNonEmptyString(firstImage.url)) {
        errors.push('image[0].url is missing');
      }
    } else {
      errors.push('image[0] has invalid type');
    }
    return errors;
  }

  // Handle ImageObject
  if (isValidObject(image)) {
    if (!isNonEmptyString(image.url)) {
      errors.push('image.url is missing');
    }
    return errors;
  }

  errors.push('image has invalid type');
  return errors;
}

/**
 * Validate headline field
 */
function validateHeadline(headline: unknown): string[] {
  const errors: string[] = [];

  if (!isNonEmptyString(headline)) {
    errors.push('headline is missing or empty');
    return errors;
  }

  // Google recommends headline max 110 characters
  if (headline.length > 110) {
    errors.push(`headline exceeds 110 characters (${headline.length} chars)`);
  }

  return errors;
}

/**
 * Validate description field
 */
function validateDescription(description: unknown): string[] {
  const errors: string[] = [];

  if (description === undefined || description === null) {
    errors.push('description is missing');
    return errors;
  }

  if (!isNonEmptyString(description)) {
    errors.push('description must be a non-empty string');
    return errors;
  }

  return errors;
}

/**
 * Validate articleSection field
 */
function validateArticleSection(section: unknown): string[] {
  const errors: string[] = [];

  if (section === undefined || section === null) {
    errors.push('articleSection is missing');
    return errors;
  }

  if (!isNonEmptyString(section)) {
    errors.push('articleSection must be a non-empty string');
    return errors;
  }

  return errors;
}

/**
 * Validate keywords field
 */
function validateKeywords(keywords: unknown): string[] {
  const errors: string[] = [];

  if (keywords === undefined || keywords === null) {
    errors.push('keywords is missing');
    return errors;
  }

  // Handle comma-separated string
  if (typeof keywords === 'string') {
    if (keywords.trim().length === 0) {
      errors.push('keywords cannot be empty');
    }
    return errors;
  }

  // Handle array
  if (Array.isArray(keywords)) {
    if (keywords.length === 0) {
      errors.push('keywords array is empty');
    }
    return errors;
  }

  errors.push('keywords has invalid type');
  return errors;
}

/**
 * Determine the article type from schema
 */
function getArticleType(schema: ArticleSchema): ArticleSchemaType {
  const type = schema['@type'];
  
  if (typeof type === 'string') {
    if (type === 'NewsArticle') return 'NewsArticle';
    if (type === 'BlogPosting') return 'BlogPosting';
    if (type === 'Article') return 'Article';
  }
  
  if (Array.isArray(type)) {
    if (type.includes('NewsArticle')) return 'NewsArticle';
    if (type.includes('BlogPosting')) return 'BlogPosting';
    if (type.includes('Article')) return 'Article';
  }
  
  return 'Article';
}

/**
 * Validate a single article schema
 */
export function validateArticleSchema(schema: ArticleSchema): ArticleValidationResult {
  const found: string[] = [];
  const missingRequired: string[] = [];
  const missingRecommended: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  const type = getArticleType(schema);

  // Validate headline (headline or name)
  const headline = getHeadline(schema);
  if (headline !== undefined) {
    found.push('headline');
    const headlineErrors = validateHeadline(headline);
    errors.push(...headlineErrors);
  } else {
    missingRequired.push('headline');
    errors.push('headline is missing');
  }

  // Validate author
  const authorErrors = validateAuthor(schema.author);
  if (authorErrors.length === 0 || (authorErrors.length > 0 && schema.author !== undefined)) {
    if (schema.author !== undefined) {
      found.push('author');
    }
  }
  if (schema.author === undefined) {
    missingRequired.push('author');
  }
  errors.push(...authorErrors);

  // Validate datePublished
  const datePublishedResult = validateDate(schema.datePublished, 'datePublished');
  if (datePublishedResult.errors.length === 0 && schema.datePublished !== undefined) {
    found.push('datePublished');
  } else if (schema.datePublished === undefined) {
    missingRequired.push('datePublished');
  }
  errors.push(...datePublishedResult.errors);
  warnings.push(...datePublishedResult.warnings);

  // Validate publisher
  const publisherErrors = validatePublisher(schema.publisher);
  if (publisherErrors.length === 0 || (publisherErrors.length > 0 && schema.publisher !== undefined)) {
    if (schema.publisher !== undefined) {
      found.push('publisher');
    }
  }
  if (schema.publisher === undefined) {
    missingRequired.push('publisher');
  }
  errors.push(...publisherErrors);

  // Validate recommended fields

  // dateModified
  if (schema.dateModified !== undefined) {
    found.push('dateModified');
    const dateModifiedResult = validateDate(schema.dateModified, 'dateModified');
    errors.push(...dateModifiedResult.errors);
    warnings.push(...dateModifiedResult.warnings);
  } else {
    missingRecommended.push('dateModified');
  }

  // description
  if (schema.description !== undefined) {
    found.push('description');
    const descriptionErrors = validateDescription(schema.description);
    errors.push(...descriptionErrors);
  } else {
    missingRecommended.push('description');
  }

  // image
  if (schema.image !== undefined) {
    found.push('image');
    const imageErrors = validateImage(schema.image);
    errors.push(...imageErrors);
  } else {
    missingRecommended.push('image');
  }

  // articleSection
  if (schema.articleSection !== undefined) {
    found.push('articleSection');
    const sectionErrors = validateArticleSection(schema.articleSection);
    errors.push(...sectionErrors);
  } else {
    missingRecommended.push('articleSection');
  }

  // keywords
  if (schema.keywords !== undefined) {
    found.push('keywords');
    const keywordsErrors = validateKeywords(schema.keywords);
    errors.push(...keywordsErrors);
  } else {
    missingRecommended.push('keywords');
  }

  // Calculate score
  let score = 0;
  
  // Required fields contribute 80% of score
  const requiredWeight = 80 / REQUIRED_FIELDS.length;
  for (const field of REQUIRED_FIELDS) {
    if (found.includes(field)) {
      score += requiredWeight;
    }
  }
  
  // Recommended fields contribute 20% of score
  const recommendedWeight = 20 / RECOMMENDED_FIELDS.length;
  for (const field of RECOMMENDED_FIELDS) {
    if (found.includes(field)) {
      score += recommendedWeight;
    }
  }

  // Deduct points for errors (but don't go below 0)
  score = Math.max(0, score - errors.length * 5);

  return {
    type,
    score: Math.round(score),
    found: Object.freeze(found),
    missingRequired: Object.freeze(missingRequired),
    missingRecommended: Object.freeze(missingRecommended),
    errors: Object.freeze(errors),
    warnings: Object.freeze(warnings),
  };
}

/**
 * Extract JSON-LD scripts from HTML as raw strings.
 * Delegates to the canonical implementation in jsonld-utils which enforces
 * MAX_HTML_SIZE, MAX_SCRIPTS, and MAX_SCRIPT_SIZE limits.
 */
export function extractJsonLdScripts(html: string): string[] {
  return [...extractRawJsonLdScripts(html)];
}

/**
 * Check if a schema is an article type
 */
export function isArticleSchema(schema: Record<string, unknown>): boolean {
  const type = schema['@type'];
  
  if (typeof type === 'string') {
    return ['Article', 'BlogPosting', 'NewsArticle'].includes(type);
  }
  
  if (Array.isArray(type)) {
    return type.some((t) => ['Article', 'BlogPosting', 'NewsArticle'].includes(t));
  }
  
  return false;
}

/**
 * Parse JSON-LD scripts and extract article schemas
 */
export function extractArticleSchemas(jsonLdScripts: readonly string[]): ArticleSchema[] {
  const articles: ArticleSchema[] = [];
  
  for (const script of jsonLdScripts) {
    try {
      const parsed = JSON.parse(script) as Record<string, unknown> | Record<string, unknown>[];
      
      // Handle array of schemas
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (isValidObject(item) && isArticleSchema(item)) {
            articles.push(item as ArticleSchema);
          }
        }
      } else if (isValidObject(parsed) && isArticleSchema(parsed)) {
        // Handle single schema
        articles.push(parsed as ArticleSchema);
      }
    } catch {
      // Invalid JSON, skip
    }
  }
  
  return articles;
}

/**
 * Main validation function for article schemas
 * Parses HTML, extracts JSON-LD, validates article schemas
 */
/**
 * Accepts pre-parsed JSON-LD scripts to avoid redundant HTML extraction.
 */
export function validateArticleSchemas(scripts: readonly unknown[]): ArticleValidatorResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (scripts.length === 0) {
    return {
      found: false,
      articles: Object.freeze([]),
      totalScore: 0,
      errors: Object.freeze(['No JSON-LD scripts found']),
      warnings: Object.freeze([]),
    };
  }

  // Extract article schemas from pre-parsed scripts — no re-parsing needed
  const articleSchemas: ArticleSchema[] = [];
  for (const script of scripts) {
    if (typeof script !== 'object' || script === null) { continue; }
    const scriptObj = script as Record<string, unknown>;
    if (scriptObj['@graph'] && Array.isArray(scriptObj['@graph'])) {
      for (const item of scriptObj['@graph']) {
        if (isValidObject(item) && isArticleSchema(item)) {
          articleSchemas.push(item as ArticleSchema);
        }
      }
    } else if (isArticleSchema(scriptObj)) {
      articleSchemas.push(scriptObj as ArticleSchema);
    }
  }

  if (articleSchemas.length === 0) {
    return {
      found: false,
      articles: Object.freeze([]),
      totalScore: 0,
      errors: Object.freeze(['No Article, BlogPosting, or NewsArticle schema found']),
      warnings: Object.freeze([]),
    };
  }
  
  // Validate each article schema
  const validationResults: ArticleValidationResult[] = [];
  let totalScore = 0;
  
  for (const schema of articleSchemas) {
    const result = validateArticleSchema(schema);
    validationResults.push(result);
    totalScore += result.score;
  }
  
  // Calculate average score
  const averageScore = Math.round(totalScore / articleSchemas.length);
  
  // Collect all errors and warnings
  for (const result of validationResults) {
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }
  
  return {
    found: true,
    articles: Object.freeze(validationResults),
    totalScore: averageScore,
    errors: Object.freeze(errors),
    warnings: Object.freeze(warnings),
  };
}

/**
 * Get article schema recommendations
 */
export function getArticleRecommendations(result: ArticleValidatorResult): string[] {
  const recommendations: string[] = [];
  
  if (!result.found) {
    recommendations.push('Add Article, BlogPosting, or NewsArticle schema to your page');
    return recommendations;
  }
  
  for (const article of result.articles) {
    if (article.missingRequired.length > 0) {
      recommendations.push(`Add required fields: ${article.missingRequired.join(', ')}`);
    }
    
    if (article.missingRecommended.length > 0) {
      recommendations.push(`Consider adding recommended fields: ${article.missingRecommended.join(', ')}`);
    }
    
    // Specific recommendations based on errors
    for (const error of article.errors) {
      if (error.includes('author.@type')) {
        recommendations.push('Set author.@type to "Person" or "Organization"');
      }
      if (error.includes('publisher.name')) {
        recommendations.push('Add publisher.name to identify the publishing organization');
      }
      if (error.includes('headline exceeds')) {
        recommendations.push('Keep headline under 110 characters for optimal display');
      }
    }
    
    // Specific recommendations based on warnings
    for (const warning of article.warnings) {
      if (warning.includes('ISO 8601')) {
        recommendations.push('Use ISO 8601 format for dates (e.g., "2024-01-15T10:30:00Z")');
      }
    }
  }
  
  return [...new Set(recommendations)]; // Remove duplicates
}

export default {
  validateArticleSchemas,
  validateArticleSchema,
  extractJsonLdScripts,
  extractArticleSchemas,
  isArticleSchema,
  getArticleRecommendations,
};
