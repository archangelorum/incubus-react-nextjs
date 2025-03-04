/*
  Warnings:

  - The primary key for the `bundles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `bundles` table. All the data in the column will be lost.
  - The primary key for the `bundles_games` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `boundle_id` on the `bundles_games` table. All the data in the column will be lost.
  - The primary key for the `genres` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `genres` table. All the data in the column will be lost.
  - The primary key for the `publishers_staff` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `publishers_staff` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `sessions` table. All the data in the column will be lost.
  - Added the required column `bundle_id` to the `bundles_games` table without a default value. This is not possible if the table is not empty.
  - Added the required column `genre_id` to the `genres` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `publishers_staff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `sessions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bundles_games" DROP CONSTRAINT "bundles_games_boundle_id_fkey";

-- DropForeignKey
ALTER TABLE "games_genres" DROP CONSTRAINT "games_genres_genre_id_fkey";

-- DropForeignKey
ALTER TABLE "publishers_staff" DROP CONSTRAINT "publishers_staff_userId_fkey";

-- AlterTable
ALTER TABLE "bundles" DROP CONSTRAINT "bundles_pkey",
DROP COLUMN "id",
ADD COLUMN     "bundle_id" SERIAL NOT NULL,
ADD CONSTRAINT "bundles_pkey" PRIMARY KEY ("bundle_id");

-- AlterTable
ALTER TABLE "bundles_games" DROP CONSTRAINT "bundles_games_pkey",
DROP COLUMN "boundle_id",
ADD COLUMN     "bundle_id" INTEGER NOT NULL,
ADD CONSTRAINT "bundles_games_pkey" PRIMARY KEY ("bundle_id", "game_id");

-- AlterTable
ALTER TABLE "genres" DROP CONSTRAINT "genres_pkey",
DROP COLUMN "id",
ADD COLUMN     "genre_id" INTEGER NOT NULL,
ADD CONSTRAINT "genres_pkey" PRIMARY KEY ("genre_id");

-- AlterTable
ALTER TABLE "publishers_staff" DROP CONSTRAINT "publishers_staff_pkey",
DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD CONSTRAINT "publishers_staff_pkey" PRIMARY KEY ("user_id");

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "bundles_games" ADD CONSTRAINT "bundles_games_bundle_id_fkey" FOREIGN KEY ("bundle_id") REFERENCES "bundles"("bundle_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games_genres" ADD CONSTRAINT "games_genres_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "genres"("genre_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publishers_staff" ADD CONSTRAINT "publishers_staff_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
