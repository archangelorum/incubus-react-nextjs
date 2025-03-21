import { z } from "zod";
import { CommonValidators } from "../utils/validation";

/**
 * Schema for creating a new organization
 */
export const createOrganizationSchema = z.object({
  name: z.string().min(2, { message: "Organization name must be at least 2 characters" }),
  slug: z.string()
    .min(3, { message: "Slug must be at least 3 characters" })
    .max(50, { message: "Slug must be at most 50 characters" })
    .regex(/^[a-z0-9-]+$/, { message: "Slug can only contain lowercase letters, numbers, and hyphens" })
    .optional(),
  logo: z.string().url().optional(),
  metadata: z.string().optional()
});

/**
 * Schema for updating an organization
 */
export const updateOrganizationSchema = z.object({
  name: z.string().min(2, { message: "Organization name must be at least 2 characters" }).optional(),
  slug: z.string()
    .min(3, { message: "Slug must be at least 3 characters" })
    .max(50, { message: "Slug must be at most 50 characters" })
    .regex(/^[a-z0-9-]+$/, { message: "Slug can only contain lowercase letters, numbers, and hyphens" })
    .optional(),
  logo: z.string().url().optional().nullable(),
  metadata: z.string().optional().nullable()
});

/**
 * Schema for organization query parameters
 */
export const organizationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(["name", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().optional()
});

/**
 * Schema for organization ID parameter
 */
export const organizationIdSchema = z.object({
  id: CommonValidators.id
});

/**
 * Schema for adding a member to an organization
 */
export const addMemberSchema = z.object({
  userId: CommonValidators.id,
  role: z.string().min(1, { message: "Role is required" })
});

/**
 * Schema for updating a member's role in an organization
 */
export const updateMemberSchema = z.object({
  role: z.string().min(1, { message: "Role is required" })
});

/**
 * Schema for creating an invitation
 */
export const createInvitationSchema = z.object({
  email: CommonValidators.email,
  role: z.string().optional()
});