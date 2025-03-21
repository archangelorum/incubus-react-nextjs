import { NextRequest } from "next/server";
import { prisma } from "@/prisma";
import { authorizeAdmin } from "../utils/auth";
import { 
  successResponse, 
  errorResponse, 
  paginatedResponse, 
  notFoundResponse 
} from "../utils/response";
import { 
  getPaginationParams, 
  getSortParams, 
  getFilterParams, 
  getSearchParams, 
  combineQueryParams 
} from "../utils/query";
import { validateBody, validateQuery } from "../utils/validation";
import { createUserSchema, userQuerySchema } from "./schema";

/**
 * GET /api/users
 * 
 * Retrieves a paginated list of users
 * Supports filtering, sorting, and searching
 * 
 * @requires Admin role
 * 
 * @param req - The incoming request
 * @returns Paginated list of users
 */
export async function GET(req: NextRequest) {
  try {
    // Authorize admin access
    const session = await authorizeAdmin(req);
    if (session instanceof Response) return session;

    // Validate query parameters
    const queryResult = validateQuery(req, userQuerySchema);
    if (queryResult instanceof Response) return queryResult;

    // Get pagination, sorting, and filtering parameters
    const { page, limit, skip } = getPaginationParams(req);
    const { orderBy } = getSortParams(
      req, 
      "createdAt", 
      "desc", 
      ["name", "email", "createdAt", "updatedAt", "role"]
    );
    
    const filterParams = getFilterParams(req, {
      role: "role",
      banned: "banned"
    });
    
    const searchParams = getSearchParams(req, ["name", "email"]);
    const where = combineQueryParams(filterParams, searchParams).where;

    // Fetch users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          role: true,
          banned: true,
          banReason: true,
          banExpires: true,
          // Exclude sensitive information
          sessions: false,
          accounts: false,
          passkeys: false
        }
      }),
      prisma.user.count({ where })
    ]);

    return paginatedResponse(users, page, limit, total);
  } catch (error) {
    console.error("Error fetching users:", error);
    return errorResponse("Failed to fetch users", 500);
  }
}

/**
 * POST /api/users
 * 
 * Creates a new user
 * 
 * @requires Admin role
 * 
 * @param req - The incoming request
 * @returns The created user
 */
export async function POST(req: NextRequest) {
  try {
    // Authorize admin access
    const session = await authorizeAdmin(req);
    if (session instanceof Response) return session;

    // Validate request body
    const validatedData = await validateBody(req, createUserSchema);
    if (validatedData instanceof Response) return validatedData;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return errorResponse("A user with this email already exists", 409);
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        ...validatedData,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        banned: true,
        banReason: true,
        banExpires: true
      }
    });

    return successResponse(user, "User created successfully", undefined, 201);
  } catch (error) {
    console.error("Error creating user:", error);
    return errorResponse("Failed to create user", 500);
  }
}