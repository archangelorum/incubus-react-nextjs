/*
  Warnings:

  - You are about to drop the column `created_at` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `role_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `sessions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PlatformStaffRole" AS ENUM ('Owner', 'Admin', 'Moderator', 'Support');

-- CreateEnum
CREATE TYPE "PlayerType" AS ENUM ('Standard', 'Premium');

-- CreateEnum
CREATE TYPE "PublisherStaffRole" AS ENUM ('Publisher', 'Developer', 'Artist', 'Tester', 'QA', 'Marketing');

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_fkey";

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role_id";

-- DropTable
DROP TABLE "roles";

-- CreateTable
CREATE TABLE "games" (
    "game_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "publisher_id" INTEGER NOT NULL,
    "release_date" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discount_price" DOUBLE PRECISION,
    "description" TEXT NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("game_id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "review_id" SERIAL NOT NULL,
    "player_id" TEXT NOT NULL,
    "game_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("review_id")
);

-- CreateTable
CREATE TABLE "bundles" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "discountPrice" DOUBLE PRECISION,

    CONSTRAINT "bundles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bundles_games" (
    "bundleId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,

    CONSTRAINT "bundles_games_pkey" PRIMARY KEY ("bundleId","gameId")
);

-- CreateTable
CREATE TABLE "genres" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "genres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games_genres" (
    "gameId" INTEGER NOT NULL,
    "genreId" INTEGER NOT NULL,

    CONSTRAINT "games_genres_pkey" PRIMARY KEY ("gameId","genreId")
);

-- CreateTable
CREATE TABLE "platform_staff" (
    "user_id" TEXT NOT NULL,
    "role" "PlatformStaffRole" NOT NULL,

    CONSTRAINT "platform_staff_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "players" (
    "user_id" TEXT NOT NULL,
    "type" "PlayerType" NOT NULL DEFAULT 'Standard',

    CONSTRAINT "players_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "players_games" (
    "player_id" TEXT NOT NULL,
    "game_id" INTEGER NOT NULL,
    "owned" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "players_games_pkey" PRIMARY KEY ("player_id","game_id")
);

-- CreateTable
CREATE TABLE "publishers" (
    "publisher_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "contact_info" TEXT,

    CONSTRAINT "publishers_pkey" PRIMARY KEY ("publisher_id")
);

-- CreateTable
CREATE TABLE "publishers_staff" (
    "userId" TEXT NOT NULL,
    "publisher_id" INTEGER NOT NULL,
    "role" "PublisherStaffRole" NOT NULL,

    CONSTRAINT "publishers_staff_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "authenticators" (
    "credential_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "credential_public_key" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "credential_device_type" TEXT NOT NULL,
    "credential_backed_up" BOOLEAN NOT NULL,
    "transports" TEXT,

    CONSTRAINT "authenticators_pkey" PRIMARY KEY ("user_id","credential_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "publishers_name_key" ON "publishers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "authenticators_credential_id_key" ON "authenticators"("credential_id");

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "publishers"("publisher_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("game_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bundles_games" ADD CONSTRAINT "bundles_games_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "bundles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bundles_games" ADD CONSTRAINT "bundles_games_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("game_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games_genres" ADD CONSTRAINT "games_genres_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("game_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games_genres" ADD CONSTRAINT "games_genres_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "genres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_staff" ADD CONSTRAINT "platform_staff_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players_games" ADD CONSTRAINT "players_games_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players_games" ADD CONSTRAINT "players_games_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("game_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publishers_staff" ADD CONSTRAINT "publishers_staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publishers_staff" ADD CONSTRAINT "publishers_staff_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "publishers"("publisher_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authenticators" ADD CONSTRAINT "authenticators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
