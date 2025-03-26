import { z } from "zod";

/**
 * Schema for validating marketplace listing query parameters
 */
export const marketplaceListingQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  type: z.enum(["GAME_LICENSE", "GAME_ITEM", "BUNDLE"]).optional(),
  gameId: z.string().uuid().optional(),
  sellerId: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "SOLD", "CANCELLED", "EXPIRED"]).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  search: z.string().optional(),
});

/**
 * Schema for creating a new marketplace listing
 */
export const createMarketplaceListingSchema = z.object({
  type: z.enum(["GAME_LICENSE", "GAME_ITEM", "BUNDLE"]),
  price: z.coerce.number().min(0),
  quantity: z.coerce.number().int().min(1).default(1),
  gameId: z.string().uuid().optional(),
  itemId: z.string().uuid().optional(),
  expiresAt: z.string().datetime().optional(),
}).refine(data => {
  // Ensure that gameId is provided for GAME_LICENSE type
  if (data.type === "GAME_LICENSE" && !data.gameId) {
    return false;
  }
  // Ensure that itemId is provided for GAME_ITEM type
  if (data.type === "GAME_ITEM" && !data.itemId) {
    return false;
  }
  return true;
}, {
  message: "Game ID is required for game license listings, and Item ID is required for game item listings"
});

/**
 * Schema for updating a marketplace listing
 */
export const updateMarketplaceListingSchema = z.object({
  price: z.coerce.number().min(0).optional(),
  quantity: z.coerce.number().int().min(1).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "CANCELLED"]).optional(),
  expiresAt: z.string().datetime().optional().nullable(),
});

/**
 * Schema for purchasing a marketplace listing
 */
export const purchaseMarketplaceListingSchema = z.object({
  walletId: z.string().uuid(),
});