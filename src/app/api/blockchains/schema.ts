import { z } from "zod";
import { CommonValidators } from "../utils/validation";

/**
 * Schema for creating a new blockchain
 */
export const createBlockchainSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  chainId: z.string().min(1, { message: "Chain ID is required" }),
  rpcUrl: z.string().url({ message: "RPC URL must be a valid URL" }),
  explorerUrl: z.string().url({ message: "Explorer URL must be a valid URL" }),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false)
});

/**
 * Schema for updating a blockchain
 */
export const updateBlockchainSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }).optional(),
  rpcUrl: z.string().url({ message: "RPC URL must be a valid URL" }).optional(),
  explorerUrl: z.string().url({ message: "Explorer URL must be a valid URL" }).optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional()
});

/**
 * Schema for blockchain query parameters
 */
export const blockchainQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(["name", "createdAt"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  isActive: z.coerce.boolean().optional(),
  isDefault: z.coerce.boolean().optional(),
  search: z.string().optional()
});

/**
 * Schema for blockchain ID parameter
 */
export const blockchainIdSchema = z.object({
  id: CommonValidators.id
});