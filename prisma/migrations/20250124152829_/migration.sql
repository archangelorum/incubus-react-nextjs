/*
  Warnings:

  - You are about to drop the column `discountPrice` on the `bundles` table. All the data in the column will be lost.
  - The primary key for the `bundles_games` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `bundleId` on the `bundles_games` table. All the data in the column will be lost.
  - You are about to drop the column `gameId` on the `bundles_games` table. All the data in the column will be lost.
  - The primary key for the `games_genres` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `gameId` on the `games_genres` table. All the data in the column will be lost.
  - You are about to drop the column `genreId` on the `games_genres` table. All the data in the column will be lost.
  - Added the required column `boundle_id` to the `bundles_games` table without a default value. This is not possible if the table is not empty.
  - Added the required column `game_id` to the `bundles_games` table without a default value. This is not possible if the table is not empty.
  - Added the required column `game_id` to the `games_genres` table without a default value. This is not possible if the table is not empty.
  - Added the required column `genre_id` to the `games_genres` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bundles_games" DROP CONSTRAINT "bundles_games_bundleId_fkey";

-- DropForeignKey
ALTER TABLE "bundles_games" DROP CONSTRAINT "bundles_games_gameId_fkey";

-- DropForeignKey
ALTER TABLE "games_genres" DROP CONSTRAINT "games_genres_gameId_fkey";

-- DropForeignKey
ALTER TABLE "games_genres" DROP CONSTRAINT "games_genres_genreId_fkey";

-- AlterTable
ALTER TABLE "bundles" DROP COLUMN "discountPrice",
ADD COLUMN     "discount_price" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "bundles_games" DROP CONSTRAINT "bundles_games_pkey",
DROP COLUMN "bundleId",
DROP COLUMN "gameId",
ADD COLUMN     "boundle_id" INTEGER NOT NULL,
ADD COLUMN     "game_id" INTEGER NOT NULL,
ADD CONSTRAINT "bundles_games_pkey" PRIMARY KEY ("boundle_id", "game_id");

-- AlterTable
ALTER TABLE "games_genres" DROP CONSTRAINT "games_genres_pkey",
DROP COLUMN "gameId",
DROP COLUMN "genreId",
ADD COLUMN     "game_id" INTEGER NOT NULL,
ADD COLUMN     "genre_id" INTEGER NOT NULL,
ADD CONSTRAINT "games_genres_pkey" PRIMARY KEY ("game_id", "genre_id");

-- AddForeignKey
ALTER TABLE "bundles_games" ADD CONSTRAINT "bundles_games_boundle_id_fkey" FOREIGN KEY ("boundle_id") REFERENCES "bundles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bundles_games" ADD CONSTRAINT "bundles_games_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("game_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games_genres" ADD CONSTRAINT "games_genres_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("game_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games_genres" ADD CONSTRAINT "games_genres_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "genres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
