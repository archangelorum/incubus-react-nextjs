import { z } from "zod";
import { CommonValidators } from "../utils/validation";

/**
 * Schema for creating a new user
 */
export const createUserSchema = z.object({
  name: CommonValidators.name,
  email: CommonValidators.email,
  emailVerified: z.boolean().default(false),
  image: z.string().url().optional(),
  role: z.string().optional(),
  banned: z.boolean().optional(),
  banReason: z.string().optional(),
  banExpires: z.string().datetime().optional()
});

/**
 * Schema for updating a user
 */
export const updateUserSchema = z.object({
  name: CommonValidators.name.optional(),
  email: CommonValidators.email.optional(),
  emailVerified: z.boolean().optional(),
  image: z.string().url().optional().nullable(),
  role: z.string().optional(),
  banned: z.boolean().optional(),
  banReason: z.string().optional().nullable(),
  banExpires: z.string().datetime().optional().nullable()
});

/**
 * Schema for user query parameters
 */
export const userQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(["name", "email", "createdAt", "updatedAt", "role"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().optional(),
  role: z.string().optional(),
  banned: z.coerce.boolean().optional()
});

/**
 * Schema for user ID parameter
 */
export const userIdSchema = z.object({
  id: CommonValidators.id
});