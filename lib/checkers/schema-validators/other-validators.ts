/**
 * Deep Schema Validators for BreadcrumbList, WebPage, and LocalBusiness
 * Provides detailed validation and scoring for specific Schema.org types
 */

// ============================================================================
// Type Definitions
// ============================================================================

/** Base interface for all validation results */
export interface SchemaValidationResult {
  readonly type: string;
  readonly score: number;
  readonly found: string[];
  readonly errors: string[];
  readonly warnings: string[];
}

/** BreadcrumbList item structure */
export interface BreadcrumbItem {
  readonly '@type'?: string;
  readonly position?: number;
  readonly name?: string;
  readonly item?: string;
}

/** BreadcrumbList validation result */
export interface BreadcrumbListValidationResult extends SchemaValidationResult {
  readonly type: 'BreadcrumbList';
  readonly itemCount: number;
  readonly items: BreadcrumbItem[];
  readonly hasValidPositions: boolean;
  readonly missingPositions: number[];
}

/** WebPage validation result */
export interface WebPageValidationResult extends SchemaValidationResult {
  readonly type: 'WebPage';
  readonly hasBreadcrumbReference: boolean;
  readonly url?: string;
  readonly name?: string;
  readonly description?: string;
}

/** Geo coordinates structure */
export interface GeoCoordinates {
  readonly '@type'?: string;
  readonly latitude?: number;
  readonly longitude?: number;
}

/** Postal address structure */
export interface PostalAddress {
  readonly '@type'?: string;
  readonly streetAddress?: string;
  readonly addressLocality?: string;
  readonly addressRegion?: string;
  readonly postalCode?: string;
  readonly addressCountry?: string;
}

/** LocalBusiness validation result */
export interface LocalBusinessValidationResult extends SchemaValidationResult {
  readonly type: 'LocalBusiness';
  readonly specificType: string;
  readonly hasRequiredFields: boolean;
  readonly addressValid: boolean;
  readonly addressFields: {
    readonly streetAddress: boolean;
    readonly addressLocality: boolean;
    readonly addressRegion: boolean;
    readonly postalCode: boolean;
    readonly addressCountry: boolean;
  };
  readonly recommendedFields: {
    readonly telephone: boolean;
    readonly openingHours: boolean;
    readonly geo: boolean;
    readonly image: boolean;
    readonly priceRange: boolean;
    readonly url: boolean;
  };
}

// ============================================================================
// Scoring Constants
// ============================================================================

const BREADCRUMB_SCORES = {
  HAS_ITEM_LIST_ELEMENT: 40,
  VALID_ITEM_STRUCTURE: 30,
  SEQUENTIAL_POSITIONS: 20,
  ALL_ITEMS_COMPLETE: 10,
} as const;

const WEBPAGE_SCORES = {
  HAS_NAME: 30,
  HAS_DESCRIPTION: 30,
  HAS_URL: 25,
  HAS_BREADCRUMB_REFERENCE: 15,
} as const;

const LOCALBUSINESS_SCORES = {
  HAS_SPECIFIC_TYPE: 20,
  HAS_NAME: 20,
  HAS_VALID_ADDRESS: 30,
  HAS_TELEPHONE: 10,
  HAS_OPENING_HOURS: 10,
  HAS_GEO: 5,
  HAS_IMAGE: 5,
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Safely extract string value from schema property
 */
function extractString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value;
  }
  return undefined;
}

/**
 * Safely extract array value from schema property
 */
function extractArray(value: unknown): unknown[] | undefined {
  if (Array.isArray(value)) {
    return value;
  }
  return undefined;
}

/**
 * Safely extract object value from schema property
 */
function extractObject(value: unknown): Record<string, unknown> | undefined {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

/**
 * Check if a value is a valid URL string
 */
function isValidUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a value is a valid number
 */
function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

// ============================================================================
// BreadcrumbList Validator
// ============================================================================

/**
 * Validates a BreadcrumbList schema
 * Checks: itemListElement array, position, name, item URL, sequential positions
 * 
 * @param schema - The parsed JSON-LD schema object
 * @returns Detailed validation result with score
 */
export function validateBreadcrumbList(schema: Record<string, unknown>): BreadcrumbListValidationResult {
  const found: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  const items: BreadcrumbItem[] = [];
  let score = 0;

  // Check for itemListElement
  const itemListElement = extractArray(schema.itemListElement);
  if (!itemListElement) {
    errors.push('Missing required field: itemListElement');
    return {
      type: 'BreadcrumbList',
      score: 0,
      found,
      errors,
      warnings,
      itemCount: 0,
      items,
      hasValidPositions: false,
      missingPositions: [],
    };
  }

  found.push('itemListElement');
  score += BREADCRUMB_SCORES.HAS_ITEM_LIST_ELEMENT;

  // Validate each item
  let validItemsCount = 0;
  const positions: number[] = [];

  for (let i = 0; i < itemListElement.length; i++) {
    const item = extractObject(itemListElement[i]);
    if (!item) {
      errors.push(`Item at index ${i} is not a valid object`);
      continue;
    }

    const breadcrumbItem: BreadcrumbItem = {
      '@type': extractString(item['@type']),
      position: isValidNumber(item.position) ? item.position : undefined,
      name: extractString(item.name),
      item: extractString(item.item),
    };

    items.push(breadcrumbItem);

    // Check required fields for each item
    const itemErrors: string[] = [];
    
    if (breadcrumbItem.position === undefined) {
      itemErrors.push(`position`);
    } else {
      positions.push(breadcrumbItem.position);
    }
    
    if (!breadcrumbItem.name) {
      itemErrors.push(`name`);
    }
    
    if (!breadcrumbItem.item) {
      itemErrors.push(`item (URL)`);
    } else if (!isValidUrl(breadcrumbItem.item)) {
      warnings.push(`Item ${i + 1} has invalid URL format: ${breadcrumbItem.item}`);
    }

    if (itemErrors.length === 0) {
      validItemsCount++;
    } else {
      errors.push(`Item ${i + 1} missing: ${itemErrors.join(', ')}`);
    }
  }

  if (validItemsCount > 0) {
    score += BREADCRUMB_SCORES.VALID_ITEM_STRUCTURE;
  }

  // Check for sequential positions
  const sortedPositions = [...positions].sort((a, b) => a - b);
  const expectedPositions = Array.from({ length: sortedPositions.length }, (_, i) => i + 1);
  const missingPositions: number[] = [];
  let hasValidPositions = true;

  for (let i = 0; i < expectedPositions.length; i++) {
    if (!sortedPositions.includes(expectedPositions[i])) {
      missingPositions.push(expectedPositions[i]);
      hasValidPositions = false;
    }
  }

  // Check for duplicate positions
  const uniquePositions = new Set(positions);
  if (uniquePositions.size !== positions.length) {
    warnings.push('Duplicate position values found');
    hasValidPositions = false;
  }

  if (hasValidPositions && positions.length > 0) {
    score += BREADCRUMB_SCORES.SEQUENTIAL_POSITIONS;
    found.push('sequentialPositions');
  } else {
    if (missingPositions.length > 0) {
      warnings.push(`Missing position(s): ${missingPositions.join(', ')}`);
    }
  }

  // Check if all items are complete
  if (validItemsCount === itemListElement.length && validItemsCount > 0) {
    score += BREADCRUMB_SCORES.ALL_ITEMS_COMPLETE;
    found.push('completeItems');
  } else if (validItemsCount > 0) {
    warnings.push(`${itemListElement.length - validItemsCount} of ${itemListElement.length} items are incomplete`);
  }

  // Cap score at 100
  score = Math.min(score, 100);

  return {
    type: 'BreadcrumbList',
    score,
    found,
    errors,
    warnings,
    itemCount: items.length,
    items,
    hasValidPositions,
    missingPositions,
  };
}

// ============================================================================
// WebPage Validator
// ============================================================================

/**
 * Validates a WebPage schema
 * Checks: name, description, url, breadcrumb reference
 * 
 * @param schema - The parsed JSON-LD schema object
 * @returns Detailed validation result with score
 */
export function validateWebPage(schema: Record<string, unknown>): WebPageValidationResult {
  const found: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 0;

  // Check name
  const name = extractString(schema.name);
  if (name) {
    found.push('name');
    score += WEBPAGE_SCORES.HAS_NAME;
  } else {
    errors.push('Missing required field: name');
  }

  // Check description
  const description = extractString(schema.description);
  if (description) {
    found.push('description');
    score += WEBPAGE_SCORES.HAS_DESCRIPTION;
  } else {
    warnings.push('Missing recommended field: description');
  }

  // Check url
  const url = extractString(schema.url);
  if (url) {
    found.push('url');
    if (isValidUrl(url)) {
      score += WEBPAGE_SCORES.HAS_URL;
    } else {
      warnings.push('URL format is invalid');
    }
  } else {
    errors.push('Missing required field: url');
  }

  // Check breadcrumb reference
  let hasBreadcrumbReference = false;
  const breadcrumb = schema.breadcrumb;
  if (breadcrumb) {
    hasBreadcrumbReference = true;
    found.push('breadcrumb');
    score += WEBPAGE_SCORES.HAS_BREADCRUMB_REFERENCE;

    // Validate breadcrumb structure
    const breadcrumbObj = extractObject(breadcrumb);
    if (breadcrumbObj) {
      const breadcrumbType = extractString(breadcrumbObj['@type']);
      if (breadcrumbType !== 'BreadcrumbList') {
        warnings.push(`Breadcrumb reference should be of type BreadcrumbList, found: ${breadcrumbType || 'unknown'}`);
      }
    } else if (typeof breadcrumb === 'string') {
      // Breadcrumb can be a reference ID (e.g., "#breadcrumb")
      if (!breadcrumb.startsWith('#') && !isValidUrl(breadcrumb)) {
        warnings.push('Breadcrumb reference should be a valid URL or ID reference');
      }
    }
  } else {
    warnings.push('Missing breadcrumb reference (recommended for better navigation structure)');
  }

  // Cap score at 100
  score = Math.min(score, 100);

  return {
    type: 'WebPage',
    score,
    found,
    errors,
    warnings,
    hasBreadcrumbReference,
    url,
    name,
    description,
  };
}

// ============================================================================
// LocalBusiness Validator
// ============================================================================

/**
 * Validates a LocalBusiness schema (or specific subtypes like Restaurant, Store, etc.)
 * Checks required: @type (specific), name, address
 * Checks recommended: telephone, openingHours, geo, image
 * 
 * @param schema - The parsed JSON-LD schema object
 * @returns Detailed validation result with score
 */
export function validateLocalBusiness(schema: Record<string, unknown>): LocalBusinessValidationResult {
  const found: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 0;

  // Check @type - should be specific (not just LocalBusiness)
  const typeValue = schema['@type'];
  let specificType = 'LocalBusiness';
  
  if (typeof typeValue === 'string') {
    specificType = typeValue;
    const validSpecificTypes = [
      'Restaurant', 'Store', 'Shop', 'HairSalon', 'BeautySalon', 'AutoRepair',
      'Dentist', 'Physician', 'Lawyer', 'RealEstateAgent', 'TravelAgency',
      'BankOrCreditUnion', 'InsuranceAgency', 'ProfessionalService', 'Plumber',
      'Electrician', 'RoofingContractor', 'HousePainter', 'Locksmith',
      'MovingCompany', 'GeneralContractor', 'Attorney', 'Notary',
      'Dentist', 'MedicalClinic', 'Hospital', 'Pharmacy', 'VeterinaryCare',
      'GroceryStore', 'ClothingStore', 'ElectronicsStore', 'FurnitureStore',
      'HardwareStore', 'JewelryStore', 'LiquorStore', 'MensClothingStore',
      'MobilePhoneStore', 'MovieRentalStore', 'MusicStore', 'OfficeEquipmentStore',
      'OutletStore', 'PawnShop', 'PetStore', 'ShoeStore', 'SportingGoodsStore',
      'TireShop', 'ToyStore', 'WholesaleStore', 'CafeOrCoffeeShop', 'Bakery',
      'BarOrPub', 'Brewery', 'Distillery', 'Winery', 'NightClub', 'Casino',
      'BowlingAlley', 'ExerciseGym', 'GolfCourse', 'HealthClub', 'PublicSwimmingPool',
      'SkiResort', 'SportsActivityLocation', 'StadiumOrArena', 'TennisComplex',
      'AmusementPark', 'ArtGallery', 'Beach', 'Campground', 'Museum', 'Park',
      'PerformingArtsTheater', 'Zoo', 'Aquarium', 'TouristAttraction',
      'AutoDealer', 'AutoPartsStore', 'AutoRental', 'AutoWash', 'GasStation',
      'MotorcycleDealer', 'MotorcycleRepair', 'AccountingService', 'EmploymentAgency',
      'InternetCafe', 'Library', 'PostOffice', 'RadioStation', 'TelevisionStation',
      'TouristInformationCenter', 'FireStation', 'PoliceStation', 'CityHall',
      'Courthouse', 'DefenceEstablishment', 'Embassy', 'GovernmentOffice',
      'PostOffice', 'Airport', 'BusStation', 'BusStop', 'ParkingFacility',
      'SubwayStation', 'TaxiStand', 'TrainStation',
    ];

    if (typeValue === 'LocalBusiness') {
      warnings.push('Consider using a more specific LocalBusiness subtype (e.g., Restaurant, Store)');
    } else if (validSpecificTypes.includes(typeValue)) {
      found.push('specificType');
      score += LOCALBUSINESS_SCORES.HAS_SPECIFIC_TYPE;
    } else {
      found.push('type');
    }
  } else {
    errors.push('Missing required field: @type');
  }

  // Check name
  const name = extractString(schema.name);
  if (name) {
    found.push('name');
    score += LOCALBUSINESS_SCORES.HAS_NAME;
  } else {
    errors.push('Missing required field: name');
  }

  // Check and validate address
  const address = extractObject(schema.address);
  let addressValid = false;
  const addressFields = {
    streetAddress: false,
    addressLocality: false,
    addressRegion: false,
    postalCode: false,
    addressCountry: false,
  };

  if (address) {
    found.push('address');

    // Validate address fields
    addressFields.streetAddress = !!extractString(address.streetAddress);
    addressFields.addressLocality = !!extractString(address.addressLocality);
    addressFields.addressRegion = !!extractString(address.addressRegion);
    addressFields.postalCode = !!extractString(address.postalCode);
    addressFields.addressCountry = !!extractString(address.addressCountry);

    const requiredAddressFields = ['streetAddress', 'addressLocality', 'addressRegion', 'postalCode'] as const;
    const missingFields = requiredAddressFields.filter(field => !addressFields[field]);

    if (missingFields.length === 0) {
      addressValid = true;
      found.push('completeAddress');
      score += LOCALBUSINESS_SCORES.HAS_VALID_ADDRESS;
    } else {
      errors.push(`Address missing required fields: ${missingFields.join(', ')}`);
    }

    if (!addressFields.addressCountry) {
      warnings.push('Address should include addressCountry');
    }
  } else {
    errors.push('Missing required field: address');
  }

  // Check recommended fields
  const recommendedFields = {
    telephone: false,
    openingHours: false,
    geo: false,
    image: false,
    priceRange: false,
    url: false,
  };

  // Telephone
  const telephone = extractString(schema.telephone);
  if (telephone) {
    recommendedFields.telephone = true;
    found.push('telephone');
    score += LOCALBUSINESS_SCORES.HAS_TELEPHONE;
  } else {
    warnings.push('Missing recommended field: telephone');
  }

  // Opening hours
  const openingHours = schema.openingHours;
  if (openingHours) {
    recommendedFields.openingHours = true;
    found.push('openingHours');
    score += LOCALBUSINESS_SCORES.HAS_OPENING_HOURS;

    // Validate opening hours format
    if (typeof openingHours === 'string') {
      // Should follow format like "Mo-Fr 09:00-17:00"
      const ohPattern = /^([A-Za-z]{2}(-[A-Za-z]{2})?(,[A-Za-z]{2})*\s+\d{2}:\d{2}-\d{2}:\d{2})$/;
      if (!ohPattern.test(openingHours)) {
        warnings.push('Opening hours format may be invalid (expected format: "Mo-Fr 09:00-17:00")');
      }
    } else if (Array.isArray(openingHours)) {
      // Array of opening hours specifications
      if (openingHours.length === 0) {
        warnings.push('Opening hours array is empty');
      }
    }
  } else {
    warnings.push('Missing recommended field: openingHours');
  }

  // Geo coordinates
  const geo = extractObject(schema.geo);
  if (geo) {
    const geoType = extractString(geo['@type']);
    const latitude = geo.latitude;
    const longitude = geo.longitude;

    if (geoType === 'GeoCoordinates' && isValidNumber(latitude) && isValidNumber(longitude)) {
      recommendedFields.geo = true;
      found.push('geo');
      score += LOCALBUSINESS_SCORES.HAS_GEO;
    } else {
      warnings.push('Geo coordinates should have @type: GeoCoordinates with valid latitude and longitude');
    }
  } else {
    warnings.push('Missing recommended field: geo (for map display)');
  }

  // Image
  const image = schema.image;
  if (image) {
    recommendedFields.image = true;
    found.push('image');
    score += LOCALBUSINESS_SCORES.HAS_IMAGE;

    if (typeof image === 'string') {
      if (!isValidUrl(image)) {
        warnings.push('Image should be a valid URL');
      }
    } else if (Array.isArray(image)) {
      if (image.length === 0) {
        warnings.push('Image array is empty');
      }
    } else if (typeof image === 'object') {
      const imageObj = extractObject(image);
      if (imageObj && extractString(imageObj['@type']) !== 'ImageObject') {
        warnings.push('Image object should have @type: ImageObject');
      }
    }
  } else {
    warnings.push('Missing recommended field: image');
  }

  // Price range
  const priceRange = extractString(schema.priceRange);
  if (priceRange) {
    recommendedFields.priceRange = true;
    found.push('priceRange');
  }

  // URL
  const url = extractString(schema.url);
  if (url) {
    recommendedFields.url = true;
    found.push('url');
    if (!isValidUrl(url)) {
      warnings.push('URL format is invalid');
    }
  }

  // Check hasRequiredFields
  const hasRequiredFields = !!name && addressValid;

  // Cap score at 100
  score = Math.min(score, 100);

  return {
    type: 'LocalBusiness',
    score,
    found,
    errors,
    warnings,
    specificType,
    hasRequiredFields,
    addressValid,
    addressFields,
    recommendedFields,
  };
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if a validation result is for BreadcrumbList
 */
export function isBreadcrumbListResult(
  result: SchemaValidationResult
): result is BreadcrumbListValidationResult {
  return result.type === 'BreadcrumbList';
}

/**
 * Type guard to check if a validation result is for WebPage
 */
export function isWebPageResult(
  result: SchemaValidationResult
): result is WebPageValidationResult {
  return result.type === 'WebPage';
}

/**
 * Type guard to check if a validation result is for LocalBusiness
 */
export function isLocalBusinessResult(
  result: SchemaValidationResult
): result is LocalBusinessValidationResult {
  return result.type === 'LocalBusiness';
}

// ============================================================================
// Main Entry Point
// ============================================================================

/**
 * Validates a schema based on its @type
 * Automatically routes to the appropriate validator
 * 
 * @param schema - The parsed JSON-LD schema object
 * @returns Validation result or null if type is not supported
 */
export function validateSchema(schema: Record<string, unknown>): SchemaValidationResult | null {
  const type = extractString(schema['@type']);
  
  if (!type) {
    return null;
  }

  switch (type) {
    case 'BreadcrumbList':
      return validateBreadcrumbList(schema);
    case 'WebPage':
      return validateWebPage(schema);
    case 'LocalBusiness':
    case 'Restaurant':
    case 'Store':
    case 'Shop':
    case 'HairSalon':
    case 'BeautySalon':
    case 'AutoRepair':
    case 'Dentist':
    case 'Physician':
    case 'Lawyer':
    case 'RealEstateAgent':
    case 'TravelAgency':
    case 'BankOrCreditUnion':
    case 'InsuranceAgency':
    case 'ProfessionalService':
    case 'Plumber':
    case 'Electrician':
    case 'RoofingContractor':
    case 'HousePainter':
    case 'Locksmith':
    case 'MovingCompany':
    case 'GeneralContractor':
    case 'Attorney':
    case 'Notary':
    case 'MedicalClinic':
    case 'Hospital':
    case 'Pharmacy':
    case 'VeterinaryCare':
    case 'GroceryStore':
    case 'ClothingStore':
    case 'ElectronicsStore':
    case 'FurnitureStore':
    case 'HardwareStore':
    case 'JewelryStore':
    case 'LiquorStore':
    case 'MensClothingStore':
    case 'MobilePhoneStore':
    case 'MovieRentalStore':
    case 'MusicStore':
    case 'OfficeEquipmentStore':
    case 'OutletStore':
    case 'PawnShop':
    case 'PetStore':
    case 'ShoeStore':
    case 'SportingGoodsStore':
    case 'TireShop':
    case 'ToyStore':
    case 'WholesaleStore':
    case 'CafeOrCoffeeShop':
    case 'Bakery':
    case 'BarOrPub':
    case 'Brewery':
    case 'Distillery':
    case 'Winery':
    case 'NightClub':
    case 'Casino':
    case 'BowlingAlley':
    case 'ExerciseGym':
    case 'GolfCourse':
    case 'HealthClub':
    case 'PublicSwimmingPool':
    case 'SkiResort':
    case 'SportsActivityLocation':
    case 'StadiumOrArena':
    case 'TennisComplex':
    case 'AmusementPark':
    case 'ArtGallery':
    case 'Beach':
    case 'Campground':
    case 'Museum':
    case 'Park':
    case 'PerformingArtsTheater':
    case 'Zoo':
    case 'Aquarium':
    case 'TouristAttraction':
    case 'AutoDealer':
    case 'AutoPartsStore':
    case 'AutoRental':
    case 'AutoWash':
    case 'GasStation':
    case 'MotorcycleDealer':
    case 'MotorcycleRepair':
    case 'AccountingService':
    case 'EmploymentAgency':
    case 'InternetCafe':
    case 'Library':
    case 'PostOffice':
    case 'RadioStation':
    case 'TelevisionStation':
    case 'TouristInformationCenter':
    case 'FireStation':
    case 'PoliceStation':
    case 'CityHall':
    case 'Courthouse':
    case 'DefenceEstablishment':
    case 'Embassy':
    case 'GovernmentOffice':
    case 'Airport':
    case 'BusStation':
    case 'BusStop':
    case 'ParkingFacility':
    case 'SubwayStation':
    case 'TaxiStand':
    case 'TrainStation':
      return validateLocalBusiness(schema);
    default:
      return null;
  }
}
