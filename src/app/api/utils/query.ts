import { NextRequest } from "next/server";

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Sorting parameters
 */
export interface SortParams {
  orderBy: Record<string, "asc" | "desc">;
}

/**
 * Filter parameters
 */
export interface FilterParams {
  where: Record<string, any>;
}

/**
 * Extracts pagination parameters from the request
 * 
 * @param req - The incoming request
 * @param defaultLimit - Default number of items per page (default: 10)
 * @param maxLimit - Maximum number of items per page (default: 100)
 * @returns Pagination parameters
 */
export function getPaginationParams(
  req: NextRequest,
  defaultLimit: number = 10,
  maxLimit: number = 100
): PaginationParams {
  const url = new URL(req.url);
  const pageParam = url.searchParams.get("page");
  const limitParam = url.searchParams.get("limit");

  const page = pageParam ? Math.max(1, parseInt(pageParam)) : 1;
  let limit = limitParam ? parseInt(limitParam) : defaultLimit;
  
  // Ensure limit doesn't exceed maxLimit
  limit = Math.min(limit, maxLimit);
  
  return {
    page,
    limit,
    skip: (page - 1) * limit
  };
}

/**
 * Extracts sorting parameters from the request
 * 
 * @param req - The incoming request
 * @param defaultField - Default field to sort by
 * @param defaultOrder - Default sort order (default: "desc")
 * @param allowedFields - Array of fields that are allowed to be sorted
 * @returns Sorting parameters
 */
export function getSortParams(
  req: NextRequest,
  defaultField: string,
  defaultOrder: "asc" | "desc" = "desc",
  allowedFields: string[] = []
): SortParams {
  const url = new URL(req.url);
  const sortField = url.searchParams.get("sortBy") || defaultField;
  const sortOrder = url.searchParams.get("sortOrder") as "asc" | "desc" || defaultOrder;
  
  // If sortField is not in allowedFields and allowedFields is not empty, use defaultField
  const field = allowedFields.length > 0 && !allowedFields.includes(sortField) 
    ? defaultField 
    : sortField;
  
  return {
    orderBy: { [field]: sortOrder }
  };
}

/**
 * Extracts filter parameters from the request
 * 
 * @param req - The incoming request
 * @param allowedFilters - Object mapping query parameter names to database field names
 * @returns Filter parameters
 */
export function getFilterParams(
  req: NextRequest,
  allowedFilters: Record<string, string> = {}
): FilterParams {
  const url = new URL(req.url);
  const where: Record<string, any> = {};
  
  // Process each allowed filter
  Object.entries(allowedFilters).forEach(([queryParam, dbField]) => {
    const value = url.searchParams.get(queryParam);
    if (value !== null) {
      // Handle special case for boolean values
      if (value.toLowerCase() === "true") {
        where[dbField] = true;
      } else if (value.toLowerCase() === "false") {
        where[dbField] = false;
      } else {
        where[dbField] = value;
      }
    }
  });
  
  return { where };
}

/**
 * Extracts search parameters from the request
 * 
 * @param req - The incoming request
 * @param searchFields - Array of fields to search in
 * @returns Search filter object for Prisma
 */
export function getSearchParams(
  req: NextRequest,
  searchFields: string[] = []
): Record<string, any> {
  const url = new URL(req.url);
  const searchQuery = url.searchParams.get("search");
  
  if (!searchQuery || searchFields.length === 0) {
    return {};
  }
  
  // Create OR conditions for each search field
  const searchConditions = searchFields.map(field => ({
    [field]: {
      contains: searchQuery,
      mode: "insensitive" as const
    }
  }));
  
  return {
    OR: searchConditions
  };
}

/**
 * Combines filter and search parameters
 * 
 * @param filterParams - Filter parameters
 * @param searchParams - Search parameters
 * @returns Combined where clause for Prisma
 */
export function combineQueryParams(
  filterParams: FilterParams,
  searchParams: Record<string, any>
): FilterParams {
  // If there are no search parameters, return the filter parameters
  if (!searchParams.OR) {
    return filterParams;
  }
  
  // If there are no filter parameters, return the search parameters
  if (Object.keys(filterParams.where).length === 0) {
    return { where: searchParams };
  }
  
  // Combine filter and search parameters with AND
  return {
    where: {
      AND: [
        filterParams.where,
        searchParams
      ]
    }
  };
}