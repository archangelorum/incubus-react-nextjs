import { z } from "zod";
import { CommonValidators } from "../utils/validation";

/**
 * Schema for creating a new wallet
 */
export const createWalletSchema = z.object({
  blockchainId: CommonValidators.id,
  address: z.string().min(1, { message: "Wallet address is required" }),
  isDefault: z.boolean().default(false),
  label: z.string().optional()
});

/**
 * Schema for updating a wallet
 */
export const updateWalletSchema = z.object({
  isDefault: z.boolean().optional(),
  label: z.string().optional().nullable()
});

/**
 * Schema for wallet query parameters
 */
export const walletQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(["createdAt", "updatedAt", "balance", "label"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  blockchainId: CommonValidators.id.optional(),
  isDefault: z.coerce.boolean().optional()
});

/**
 * Schema for wallet ID parameter
 */
export const walletIdSchema = z.object({
  id: CommonValidators.id
});

/**
 * Schema for syncing wallet balance
 */
export const syncWalletSchema = z.object({
  forceSync: z.boolean().default(false)
});