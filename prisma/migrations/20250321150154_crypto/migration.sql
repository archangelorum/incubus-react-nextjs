/*
  Warnings:

  - You are about to drop the `bundles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bundles_games` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `games` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `games_genres` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `genres` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `platform_staff` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `players` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `players_games` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `publishers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `publishers_staff` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `purchases` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reviews` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `wishlist_items` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('GAME_PURCHASE', 'GAME_TRANSFER', 'ITEM_PURCHASE', 'ITEM_TRANSFER', 'ESCROW_DEPOSIT', 'ESCROW_RELEASE', 'ESCROW_REFUND', 'PLATFORM_FEE', 'ROYALTY_PAYMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED', 'REVERTED');

-- CreateEnum
CREATE TYPE "StorageType" AS ENUM ('CENTRALIZED', 'DECENTRALIZED', 'HYBRID');

-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('STANDARD', 'PREMIUM', 'COLLECTOR', 'SUBSCRIPTION', 'TRIAL');

-- CreateEnum
CREATE TYPE "LicenseTransactionType" AS ENUM ('PURCHASE', 'TRANSFER', 'GIFT', 'REVOKE');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('COSMETIC', 'FUNCTIONAL', 'CONSUMABLE', 'COLLECTIBLE', 'CURRENCY');

-- CreateEnum
CREATE TYPE "ItemRarity" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'UNIQUE');

-- CreateEnum
CREATE TYPE "ItemTransactionType" AS ENUM ('PURCHASE', 'TRANSFER', 'TRADE', 'GIFT', 'CONSUME');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('GAME_LICENSE', 'GAME_ITEM', 'BUNDLE');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SOLD', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "EscrowStatus" AS ENUM ('PENDING', 'FUNDED', 'RELEASED', 'REFUNDED', 'DISPUTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "EscrowTransactionType" AS ENUM ('DEPOSIT', 'RELEASE', 'REFUND', 'FEE');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('SALES', 'USER_ACTIVITY', 'GAME_PERFORMANCE', 'MARKETPLACE_ACTIVITY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "IndexStatus" AS ENUM ('ACTIVE', 'PAUSED', 'REINDEXING', 'ERROR');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PASSED', 'REJECTED', 'IMPLEMENTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProposalType" AS ENUM ('FEATURE_REQUEST', 'POLICY_CHANGE', 'PARAMETER_CHANGE', 'FUND_ALLOCATION', 'OTHER');

-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('FOR', 'AGAINST', 'ABSTAIN');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "DisputeType" AS ENUM ('TRANSACTION', 'CONTENT', 'USER_BEHAVIOR', 'TECHNICAL', 'OTHER');

-- CreateEnum
CREATE TYPE "ShardStrategy" AS ENUM ('GEOGRAPHIC', 'USER_BASED', 'CONTENT_BASED', 'HYBRID');

-- DropForeignKey
ALTER TABLE "bundles_games" DROP CONSTRAINT "bundles_games_bundle_id_fkey";

-- DropForeignKey
ALTER TABLE "bundles_games" DROP CONSTRAINT "bundles_games_game_id_fkey";

-- DropForeignKey
ALTER TABLE "games" DROP CONSTRAINT "games_publisher_id_fkey";

-- DropForeignKey
ALTER TABLE "games_genres" DROP CONSTRAINT "games_genres_game_id_fkey";

-- DropForeignKey
ALTER TABLE "games_genres" DROP CONSTRAINT "games_genres_genre_id_fkey";

-- DropForeignKey
ALTER TABLE "platform_staff" DROP CONSTRAINT "platform_staff_user_id_fkey";

-- DropForeignKey
ALTER TABLE "players" DROP CONSTRAINT "players_user_id_fkey";

-- DropForeignKey
ALTER TABLE "players_games" DROP CONSTRAINT "players_games_game_id_fkey";

-- DropForeignKey
ALTER TABLE "players_games" DROP CONSTRAINT "players_games_player_id_fkey";

-- DropForeignKey
ALTER TABLE "publishers_staff" DROP CONSTRAINT "publishers_staff_publisher_id_fkey";

-- DropForeignKey
ALTER TABLE "publishers_staff" DROP CONSTRAINT "publishers_staff_user_id_fkey";

-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_bundle_id_fkey";

-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_game_id_fkey";

-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_player_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_game_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_player_id_fkey";

-- DropForeignKey
ALTER TABLE "wishlist_items" DROP CONSTRAINT "wishlist_items_game_id_fkey";

-- DropForeignKey
ALTER TABLE "wishlist_items" DROP CONSTRAINT "wishlist_items_player_id_fkey";

-- AlterTable
ALTER TABLE "session" ADD COLUMN     "activeOrganizationId" TEXT,
ADD COLUMN     "impersonatedBy" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "banExpires" TIMESTAMP(3),
ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "banned" BOOLEAN,
ADD COLUMN     "role" TEXT;

-- DropTable
DROP TABLE "bundles";

-- DropTable
DROP TABLE "bundles_games";

-- DropTable
DROP TABLE "games";

-- DropTable
DROP TABLE "games_genres";

-- DropTable
DROP TABLE "genres";

-- DropTable
DROP TABLE "platform_staff";

-- DropTable
DROP TABLE "players";

-- DropTable
DROP TABLE "players_games";

-- DropTable
DROP TABLE "publishers";

-- DropTable
DROP TABLE "publishers_staff";

-- DropTable
DROP TABLE "purchases";

-- DropTable
DROP TABLE "reviews";

-- DropTable
DROP TABLE "wishlist_items";

-- DropEnum
DROP TYPE "GameStatus";

-- DropEnum
DROP TYPE "PaymentMethod";

-- DropEnum
DROP TYPE "PlatformStaffRole";

-- DropEnum
DROP TYPE "PlayerType";

-- DropEnum
DROP TYPE "PublisherStaffRole";

-- CreateTable
CREATE TABLE "organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "metadata" TEXT,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT,
    "status" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "inviterId" TEXT NOT NULL,

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blockchain" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "chainId" TEXT NOT NULL,
    "rpcUrl" TEXT NOT NULL,
    "explorerUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blockchain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "blockchainId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "label" TEXT,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lastSynced" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "smart_contract" (
    "id" TEXT NOT NULL,
    "blockchainId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "abi" JSONB NOT NULL,
    "bytecode" TEXT,
    "deployedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "smart_contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "blockchainId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "smartContractId" TEXT,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "fee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "data" JSONB,
    "blockNumber" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT,
    "publisherId" TEXT NOT NULL,
    "releaseDate" TIMESTAMP(3) NOT NULL,
    "basePrice" DECIMAL(65,30) NOT NULL,
    "discountPrice" DECIMAL(65,30),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "contentRating" TEXT,
    "systemRequirements" JSONB,
    "coverImageId" TEXT,
    "trailerVideoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publisher" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "organizationId" TEXT,
    "royaltyPercentage" DECIMAL(65,30) NOT NULL DEFAULT 10.00,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "logoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "publisher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publisher_wallet" (
    "id" TEXT NOT NULL,
    "publisherId" TEXT NOT NULL,
    "blockchainId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "publisher_wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "developer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "organizationId" TEXT,
    "logoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "developer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "developer_game" (
    "id" TEXT NOT NULL,
    "developerId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "developer_game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_version" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "releaseNotes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "size" BIGINT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "contentCid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_genre" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "genreId" TEXT NOT NULL,

    CONSTRAINT "game_genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genre" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_tag" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "game_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_file" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "path" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "contentCid" TEXT,
    "storageType" "StorageType" NOT NULL DEFAULT 'CENTRALIZED',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "gameId" TEXT,
    "gameVersionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_file_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_license" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "nftId" TEXT,
    "nftCollectionId" TEXT,
    "licenseType" "LicenseType" NOT NULL DEFAULT 'STANDARD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_license_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_license_transaction" (
    "id" TEXT NOT NULL,
    "licenseeId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "type" "LicenseTransactionType" NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "fromWalletId" TEXT,
    "toWalletId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_license_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "gameId" TEXT NOT NULL,
    "itemType" "ItemType" NOT NULL,
    "rarity" "ItemRarity" NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "supply" INTEGER,
    "remaining" INTEGER,
    "isTransferable" BOOLEAN NOT NULL DEFAULT true,
    "isTradeable" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "contentHash" TEXT,
    "contentCid" TEXT,
    "imageId" TEXT,
    "nftCollectionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_tag" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "item_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_ownership" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "nftId" TEXT,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_ownership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_transaction" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "ownershipId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "type" "ItemTransactionType" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DECIMAL(65,30) NOT NULL,
    "fromWalletId" TEXT,
    "toWalletId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nft_collection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "blockchainId" TEXT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "standard" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nft_collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_listing" (
    "id" TEXT NOT NULL,
    "type" "ListingType" NOT NULL,
    "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "sellerId" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3),
    "gameId" TEXT,
    "itemId" TEXT,
    "escrowId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escrow" (
    "id" TEXT NOT NULL,
    "depositorWalletId" TEXT NOT NULL,
    "beneficiaryWalletId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" "EscrowStatus" NOT NULL DEFAULT 'PENDING',
    "releaseCondition" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "escrow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escrow_transaction" (
    "id" TEXT NOT NULL,
    "escrowId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "type" "EscrowTransactionType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "escrow_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_review" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "playTime" INTEGER,
    "isVerifiedPurchase" BOOLEAN NOT NULL DEFAULT false,
    "isRecommended" BOOLEAN,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_event" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "eventType" TEXT NOT NULL,
    "eventData" JSONB NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report" (
    "id" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "parameters" JSONB,
    "resultData" JSONB,
    "createdById" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blockchain_index" (
    "id" TEXT NOT NULL,
    "blockchainId" TEXT NOT NULL,
    "lastBlockProcessed" INTEGER NOT NULL,
    "lastProcessedAt" TIMESTAMP(3) NOT NULL,
    "status" "IndexStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blockchain_index_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cache_entry" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cache_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "governance_proposal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "proposerId" TEXT NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "proposalType" "ProposalType" NOT NULL,
    "votingStartsAt" TIMESTAMP(3),
    "votingEndsAt" TIMESTAMP(3),
    "implementationDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "governance_proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_vote" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "vote" "VoteType" NOT NULL,
    "votePower" DECIMAL(65,30) NOT NULL DEFAULT 1.0,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposal_vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispute_case" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "defenderId" TEXT,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "type" "DisputeType" NOT NULL,
    "relatedEntityType" TEXT,
    "relatedEntityId" TEXT,
    "resolution" TEXT,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dispute_case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shard_config" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "strategy" "ShardStrategy" NOT NULL,
    "parameters" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shard_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shard" (
    "id" TEXT NOT NULL,
    "shardConfigId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "region" TEXT,
    "capacity" INTEGER,
    "load" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_policy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "policyText" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "jurisdictions" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_consent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "consentGiven" BOOLEAN NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "consentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_consent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GameScreenshots" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GameScreenshots_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_slug_key" ON "organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_userId_blockchainId_address_key" ON "wallet"("userId", "blockchainId", "address");

-- CreateIndex
CREATE UNIQUE INDEX "smart_contract_blockchainId_address_key" ON "smart_contract"("blockchainId", "address");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_blockchainId_hash_key" ON "transaction"("blockchainId", "hash");

-- CreateIndex
CREATE UNIQUE INDEX "game_slug_key" ON "game"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "publisher_slug_key" ON "publisher"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "publisher_wallet_publisherId_blockchainId_address_key" ON "publisher_wallet"("publisherId", "blockchainId", "address");

-- CreateIndex
CREATE UNIQUE INDEX "developer_slug_key" ON "developer"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "developer_game_developerId_gameId_key" ON "developer_game"("developerId", "gameId");

-- CreateIndex
CREATE UNIQUE INDEX "game_version_gameId_version_key" ON "game_version"("gameId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "game_genre_gameId_genreId_key" ON "game_genre"("gameId", "genreId");

-- CreateIndex
CREATE UNIQUE INDEX "genre_name_key" ON "genre"("name");

-- CreateIndex
CREATE UNIQUE INDEX "genre_slug_key" ON "genre"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "game_tag_gameId_tagId_key" ON "game_tag"("gameId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "tag_name_key" ON "tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tag_slug_key" ON "tag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "game_license_gameId_walletId_key" ON "game_license"("gameId", "walletId");

-- CreateIndex
CREATE UNIQUE INDEX "item_tag_itemId_tagId_key" ON "item_tag"("itemId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "item_ownership_itemId_walletId_key" ON "item_ownership"("itemId", "walletId");

-- CreateIndex
CREATE UNIQUE INDEX "nft_collection_blockchainId_contractAddress_key" ON "nft_collection"("blockchainId", "contractAddress");

-- CreateIndex
CREATE UNIQUE INDEX "game_review_gameId_userId_key" ON "game_review"("gameId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "cache_entry_key_key" ON "cache_entry"("key");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_vote_proposalId_voterId_key" ON "proposal_vote"("proposalId", "voterId");

-- CreateIndex
CREATE UNIQUE INDEX "shard_config_name_key" ON "shard_config"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_consent_userId_policyId_key" ON "user_consent"("userId", "policyId");

-- CreateIndex
CREATE INDEX "_GameScreenshots_B_index" ON "_GameScreenshots"("B");

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_blockchainId_fkey" FOREIGN KEY ("blockchainId") REFERENCES "blockchain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "smart_contract" ADD CONSTRAINT "smart_contract_blockchainId_fkey" FOREIGN KEY ("blockchainId") REFERENCES "blockchain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_blockchainId_fkey" FOREIGN KEY ("blockchainId") REFERENCES "blockchain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_smartContractId_fkey" FOREIGN KEY ("smartContractId") REFERENCES "smart_contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game" ADD CONSTRAINT "game_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "publisher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game" ADD CONSTRAINT "game_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "content_file"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game" ADD CONSTRAINT "game_trailerVideoId_fkey" FOREIGN KEY ("trailerVideoId") REFERENCES "content_file"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publisher" ADD CONSTRAINT "publisher_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "content_file"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publisher_wallet" ADD CONSTRAINT "publisher_wallet_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "publisher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publisher_wallet" ADD CONSTRAINT "publisher_wallet_blockchainId_fkey" FOREIGN KEY ("blockchainId") REFERENCES "blockchain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "developer" ADD CONSTRAINT "developer_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "content_file"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "developer_game" ADD CONSTRAINT "developer_game_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "developer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "developer_game" ADD CONSTRAINT "developer_game_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_version" ADD CONSTRAINT "game_version_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_genre" ADD CONSTRAINT "game_genre_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_genre" ADD CONSTRAINT "game_genre_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "genre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_tag" ADD CONSTRAINT "game_tag_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_tag" ADD CONSTRAINT "game_tag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_file" ADD CONSTRAINT "content_file_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_file" ADD CONSTRAINT "content_file_gameVersionId_fkey" FOREIGN KEY ("gameVersionId") REFERENCES "game_version"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_license" ADD CONSTRAINT "game_license_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_license" ADD CONSTRAINT "game_license_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_license" ADD CONSTRAINT "game_license_nftCollectionId_fkey" FOREIGN KEY ("nftCollectionId") REFERENCES "nft_collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_license_transaction" ADD CONSTRAINT "game_license_transaction_licenseeId_fkey" FOREIGN KEY ("licenseeId") REFERENCES "game_license"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_license_transaction" ADD CONSTRAINT "game_license_transaction_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_item" ADD CONSTRAINT "game_item_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_item" ADD CONSTRAINT "game_item_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "content_file"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_item" ADD CONSTRAINT "game_item_nftCollectionId_fkey" FOREIGN KEY ("nftCollectionId") REFERENCES "nft_collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_tag" ADD CONSTRAINT "item_tag_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "game_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_tag" ADD CONSTRAINT "item_tag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_ownership" ADD CONSTRAINT "item_ownership_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "game_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_ownership" ADD CONSTRAINT "item_ownership_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_transaction" ADD CONSTRAINT "item_transaction_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "game_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_transaction" ADD CONSTRAINT "item_transaction_ownershipId_fkey" FOREIGN KEY ("ownershipId") REFERENCES "item_ownership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_transaction" ADD CONSTRAINT "item_transaction_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nft_collection" ADD CONSTRAINT "nft_collection_blockchainId_fkey" FOREIGN KEY ("blockchainId") REFERENCES "blockchain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_listing" ADD CONSTRAINT "marketplace_listing_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_listing" ADD CONSTRAINT "marketplace_listing_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "game_item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_listing" ADD CONSTRAINT "marketplace_listing_escrowId_fkey" FOREIGN KEY ("escrowId") REFERENCES "escrow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrow" ADD CONSTRAINT "escrow_depositorWalletId_fkey" FOREIGN KEY ("depositorWalletId") REFERENCES "wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrow" ADD CONSTRAINT "escrow_beneficiaryWalletId_fkey" FOREIGN KEY ("beneficiaryWalletId") REFERENCES "wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrow_transaction" ADD CONSTRAINT "escrow_transaction_escrowId_fkey" FOREIGN KEY ("escrowId") REFERENCES "escrow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrow_transaction" ADD CONSTRAINT "escrow_transaction_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_review" ADD CONSTRAINT "game_review_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockchain_index" ADD CONSTRAINT "blockchain_index_blockchainId_fkey" FOREIGN KEY ("blockchainId") REFERENCES "blockchain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_vote" ADD CONSTRAINT "proposal_vote_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "governance_proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shard" ADD CONSTRAINT "shard_shardConfigId_fkey" FOREIGN KEY ("shardConfigId") REFERENCES "shard_config"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_consent" ADD CONSTRAINT "user_consent_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "compliance_policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameScreenshots" ADD CONSTRAINT "_GameScreenshots_A_fkey" FOREIGN KEY ("A") REFERENCES "content_file"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameScreenshots" ADD CONSTRAINT "_GameScreenshots_B_fkey" FOREIGN KEY ("B") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
