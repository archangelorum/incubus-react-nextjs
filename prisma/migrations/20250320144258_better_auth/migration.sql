/*
  Warnings:

  - A unique constraint covering the columns `[player_id,game_id]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `bundles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `games` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `genres` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `platform_staff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `players` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `publishers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `publishers_staff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `reviews` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CreditCard', 'PayPal', 'CryptoWallet', 'BankTransfer');

-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('Active', 'ComingSoon', 'Deprecated');

-- AlterTable
ALTER TABLE "bundles" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "bundles_games" ADD COLUMN     "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "price_in_bundle" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "games" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "status" "GameStatus" NOT NULL DEFAULT 'Active',
ADD COLUMN     "system_requirements" JSONB,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "version" TEXT;

-- AlterTable
ALTER TABLE "games_genres" ADD COLUMN     "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "genres" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "platform_staff" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "players" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "players_games" ADD COLUMN     "favorite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_played_at" TIMESTAMP(3),
ADD COLUMN     "play_time" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "purchased_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "publishers" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "publishers_staff" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "purchases" (
    "purchase_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "game_id" INTEGER,
    "bundle_id" INTEGER,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "method" "PaymentMethod" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("purchase_id")
);

-- CreateTable
CREATE TABLE "wishlist_items" (
    "player_id" TEXT NOT NULL,
    "game_id" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("player_id","game_id")
);

-- CreateIndex
CREATE INDEX "purchases_player_id_idx" ON "purchases"("player_id");

-- CreateIndex
CREATE INDEX "purchases_game_id_idx" ON "purchases"("game_id");

-- CreateIndex
CREATE INDEX "purchases_bundle_id_idx" ON "purchases"("bundle_id");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE INDEX "authenticators_user_id_idx" ON "authenticators"("user_id");

-- CreateIndex
CREATE INDEX "games_publisher_id_idx" ON "games"("publisher_id");

-- CreateIndex
CREATE INDEX "games_title_idx" ON "games"("title");

-- CreateIndex
CREATE INDEX "publishers_name_idx" ON "publishers"("name");

-- CreateIndex
CREATE INDEX "publishers_staff_publisher_id_idx" ON "publishers_staff"("publisher_id");

-- CreateIndex
CREATE INDEX "reviews_game_id_idx" ON "reviews"("game_id");

-- CreateIndex
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_player_id_game_id_key" ON "reviews"("player_id", "game_id");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("game_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_bundle_id_fkey" FOREIGN KEY ("bundle_id") REFERENCES "bundles"("bundle_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("game_id") ON DELETE CASCADE ON UPDATE CASCADE;
