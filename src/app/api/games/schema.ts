import { z } from "zod";
import { CommonValidators } from "../utils/validation";

/**
 * Schema for creating a new game
 */
export const createGameSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  slug: z.string()
    .min(3, { message: "Slug must be at least 3 characters" })
    .max(50, { message: "Slug must be at most 50 characters" })
    .regex(/^[a-z0-9-]+$/, { message: "Slug can only contain lowercase letters, numbers, and hyphens" })
    .optional(),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  shortDescription: z.string().min(10, { message: "Short description must be at least 10 characters" }).optional(),
  publisherId: CommonValidators.id,
  developerIds: z.array(CommonValidators.id).optional(),
  releaseDate: z.string().datetime(),
  basePrice: z.coerce.number().nonnegative(),
  discountPrice: z.coerce.number().nonnegative().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  contentRating: z.string().optional(),
  systemRequirements: z.record(z.string(), z.any()).optional(),
  tagIds: z.array(CommonValidators.id).optional(),
  genreIds: z.array(CommonValidators.id).optional(),
  coverImageId: CommonValidators.id.optional(),
  trailerVideoId: CommonValidators.id.optional(),
  screenshotIds: z.array(CommonValidators.id).optional()
});

/**
 * Schema for updating a game
 */
export const updateGameSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }).optional(),
  slug: z.string()
    .min(3, { message: "Slug must be at least 3 characters" })
    .max(50, { message: "Slug must be at most 50 characters" })
    .regex(/^[a-z0-9-]+$/, { message: "Slug can only contain lowercase letters, numbers, and hyphens" })
    .optional(),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }).optional(),
  shortDescription: z.string().min(10, { message: "Short description must be at least 10 characters" }).optional().nullable(),
  publisherId: CommonValidators.id.optional(),
  developerIds: z.array(CommonValidators.id).optional(),
  releaseDate: z.string().datetime().optional(),
  basePrice: z.coerce.number().nonnegative().optional(),
  discountPrice: z.coerce.number().nonnegative().optional().nullable(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  contentRating: z.string().optional().nullable(),
  systemRequirements: z.record(z.string(), z.any()).optional().nullable(),
  tagIds: z.array(CommonValidators.id).optional(),
  genreIds: z.array(CommonValidators.id).optional(),
  coverImageId: CommonValidators.id.optional().nullable(),
  trailerVideoId: CommonValidators.id.optional().nullable(),
  screenshotIds: z.array(CommonValidators.id).optional()
});

/**
 * Schema for game query parameters
 */
export const gameQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(["title", "releaseDate", "basePrice", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().optional(),
  publisherId: CommonValidators.id.optional(),
  developerId: CommonValidators.id.optional(),
  genreId: CommonValidators.id.optional(),
  tagId: CommonValidators.id.optional(),
  isActive: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  releasedAfter: z.string().datetime().optional(),
  releasedBefore: z.string().datetime().optional()
});

/**
 * Schema for game ID parameter
 */
export const gameIdSchema = z.object({
  id: CommonValidators.id
});

/**
 * Schema for creating a game version
 */
export const createGameVersionSchema = z.object({
  version: z.string().min(1, { message: "Version is required" }),
  releaseNotes: z.string().optional(),
  isActive: z.boolean().default(true),
  size: z.coerce.number().int().positive(),
  contentHash: z.string().min(1, { message: "Content hash is required" }),
  contentCid: z.string().min(1, { message: "Content CID is required" }),
  contentFileIds: z.array(CommonValidators.id).optional()
});

/**
 * Schema for creating a game review
 */
export const createGameReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  content: z.string().optional(),
  playTime: z.number().int().nonnegative().optional(),
  isRecommended: z.boolean().optional()
});