import { NextRequest } from "next/server";
import { z } from "zod";
import { validationErrorResponse } from "./response";

/**
 * Validates request body against a Zod schema
 * 
 * @param req - The incoming request
 * @param schema - Zod schema to validate against
 * @returns Validated data or validation error response
 */
export async function validateBody<T extends z.ZodType>(
  req: NextRequest,
  schema: T
): Promise<z.infer<T> | Response> {
  try {
    const body = await req.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      
      error.errors.forEach((err) => {
        const path = err.path.join(".");
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      
      return validationErrorResponse(errors);
    }
    
    throw error;
  }
}

/**
 * Validates URL parameters against a Zod schema
 * 
 * @param params - URL parameters
 * @param schema - Zod schema to validate against
 * @returns Validated data or validation error response
 */
export function validateParams<T extends z.ZodType>(
  params: Record<string, string>,
  schema: T
): z.infer<T> | Response {
  try {
    return schema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      
      error.errors.forEach((err) => {
        const path = err.path.join(".");
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      
      return validationErrorResponse(errors);
    }
    
    throw error;
  }
}

/**
 * Validates query parameters against a Zod schema
 * 
 * @param req - The incoming request
 * @param schema - Zod schema to validate against
 * @returns Validated data or validation error response
 */
export function validateQuery<T extends z.ZodType>(
  req: NextRequest,
  schema: T
): z.infer<T> | Response {
  try {
    const url = new URL(req.url);
    const queryParams: Record<string, string> = {};
    
    url.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    
    return schema.parse(queryParams);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      
      error.errors.forEach((err) => {
        const path = err.path.join(".");
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      
      return validationErrorResponse(errors);
    }
    
    throw error;
  }
}

/**
 * Common validation schemas
 */
export const CommonValidators = {
  id: z.string().uuid({ message: "Invalid UUID format" }),
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  date: z.string().datetime({ message: "Invalid date format" }),
  url: z.string().url({ message: "Invalid URL format" }),
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10)
  })
};