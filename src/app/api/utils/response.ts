import { NextResponse } from "next/server";

/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    [key: string]: any;
  };
}

/**
 * Creates a successful API response
 * 
 * @param data - The data to include in the response
 * @param message - Optional success message
 * @param meta - Optional metadata
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with formatted success response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  meta?: ApiResponse["meta"],
  status: number = 200
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    meta
  };

  return NextResponse.json(response, { status });
}

/**
 * Creates an error API response
 * 
 * @param error - Error message or object
 * @param status - HTTP status code (default: 400)
 * @returns NextResponse with formatted error response
 */
export function errorResponse(
  error: string | Error,
  status: number = 400
): NextResponse {
  const errorMessage = error instanceof Error ? error.message : error;
  
  const response: ApiResponse = {
    success: false,
    error: errorMessage
  };

  return NextResponse.json(response, { status });
}

/**
 * Creates a paginated API response
 * 
 * @param data - The data to include in the response
 * @param page - Current page number
 * @param limit - Items per page
 * @param total - Total number of items
 * @param message - Optional success message
 * @param additionalMeta - Additional metadata to include
 * @returns NextResponse with formatted paginated response
 */
export function paginatedResponse<T>(
  data: T,
  page: number,
  limit: number,
  total: number,
  message?: string,
  additionalMeta?: Record<string, any>
): NextResponse {
  const totalPages = Math.ceil(total / limit);
  
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    meta: {
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      ...additionalMeta
    }
  };

  return NextResponse.json(response, { status: 200 });
}

/**
 * Creates a not found API response
 * 
 * @param resource - The resource that was not found
 * @returns NextResponse with formatted not found response
 */
export function notFoundResponse(resource: string): NextResponse {
  return errorResponse(`${resource} not found`, 404);
}

/**
 * Creates a validation error API response
 * 
 * @param errors - Validation errors
 * @returns NextResponse with formatted validation error response
 */
export function validationErrorResponse(
  errors: Record<string, string[]>
): NextResponse {
  const response: ApiResponse = {
    success: false,
    error: "Validation failed",
    meta: { validationErrors: errors }
  };

  return NextResponse.json(response, { status: 422 });
}