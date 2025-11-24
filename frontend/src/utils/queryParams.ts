/**
 * Safely serializes filter objects into URL query parameters.
 * 
 * This utility prevents URL_TOO_LONG errors by:
 * 1. Only allowing simple scalar values (string, number, boolean)
 * 2. Validating URL length and falling back to POST if needed
 * 3. Properly encoding values
 * 
 * @param filters - Object with filter key-value pairs
 * @param maxUrlLength - Maximum allowed URL length (default: 8000 bytes for Vercel)
 * @returns URLSearchParams object with safely serialized parameters
 */
export function buildQueryParams(
  filters: Record<string, any>,
  maxUrlLength: number = 8000
): URLSearchParams {
  const params = new URLSearchParams();

  if (!filters) {
    return params;
  }

  Object.entries(filters).forEach(([key, value]) => {
    // Skip undefined and null values
    if (value === undefined || value === null) {
      return;
    }

    // Only allow simple scalar types (string, number, boolean)
    // Reject objects, arrays, and functions
    const valueType = typeof value;
    if (valueType === 'object') {
      // Arrays and objects should not be in query params
      console.warn(
        `Filter "${key}" contains an object/array value. Skipping to prevent URL_TOO_LONG error.`,
        value
      );
      return;
    }

    // Only process primitive types
    if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
      const stringValue = String(value);
      
      // Check if adding this param would exceed max length
      // Rough estimate: key + '=' + value + '&' = key.length + value.length + 2
      const estimatedLength = key.length + stringValue.length + 2;
      if (params.toString().length + estimatedLength > maxUrlLength) {
        console.warn(
          `Adding filter "${key}" would exceed URL length limit. Skipping.`,
          `Current length: ${params.toString().length}, Estimated addition: ${estimatedLength}`
        );
        return;
      }

      params.append(key, stringValue);
    }
  });

  return params;
}

/**
 * Checks if a URL would exceed the maximum allowed length.
 * 
 * @param baseUrl - Base URL without query parameters
 * @param params - URLSearchParams object
 * @param maxLength - Maximum allowed URL length (default: 8000)
 * @returns true if URL would exceed limit
 */
export function wouldExceedUrlLength(
  baseUrl: string,
  params: URLSearchParams,
  maxLength: number = 8000
): boolean {
  const queryString = params.toString();
  const fullUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;
  return fullUrl.length > maxLength;
}

/**
 * Safely builds a query string from filters, with length validation.
 * 
 * @param filters - Object with filter key-value pairs
 * @param baseUrl - Base URL to check against (optional, for validation)
 * @returns Query string (without the '?') or empty string
 */
export function buildQueryString(
  filters?: Record<string, any>,
  baseUrl?: string
): string {
  if (!filters) {
    return '';
  }

  const params = buildQueryParams(filters);
  const queryString = params.toString();

  // If baseUrl provided, validate total length
  if (baseUrl && wouldExceedUrlLength(baseUrl, params)) {
    console.warn(
      `Query string would exceed URL length limit. Consider using POST instead of GET.`,
      `Base URL length: ${baseUrl.length}, Query string length: ${queryString.length}`
    );
  }

  return queryString;
}

