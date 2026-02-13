/**
 * Schema Validators Index
 * Exports all schema validation functions
 */

// Organization & WebSite validators
export {
  validateOrganization,
  validateWebSite,
  extractJsonLdScripts,
  findSchemasByType,
  validateOrganizationsInHtml,
  validateWebSitesInHtml,
  validateOrganizationAndWebSite,
  ORGANIZATION_REQUIRED_FIELDS,
  ORGANIZATION_RECOMMENDED_FIELDS,
  WEBSITE_REQUIRED_FIELDS,
  WEBSITE_RECOMMENDED_FIELDS,
} from './organization-validator';

export type {
  SchemaValidationResult as OrgSchemaValidationResult,
  OrganizationSchema,
  WebSiteSchema,
} from './organization-validator';

// Article validators
export {
  validateArticleSchema,
  validateArticleSchemas,
  extractArticleSchemas,
  isArticleSchema,
  getArticleRecommendations,
} from './article-validator';

export type {
  ArticleSchema,
  ArticleValidationResult,
} from './article-validator';

// Other validators (BreadcrumbList, WebPage, LocalBusiness)
export {
  validateBreadcrumbList,
  validateWebPage,
  validateLocalBusiness,
  validateSchema,
  isBreadcrumbListResult,
  isWebPageResult,
  isLocalBusinessResult,
} from './other-validators';

export type {
  BreadcrumbListValidationResult as BreadcrumbListResult,
  WebPageValidationResult as WebPageResult,
  LocalBusinessValidationResult as LocalBusinessResult,
  SchemaValidationResult,
} from './other-validators';
