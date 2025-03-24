-- CreateTable
CREATE TABLE "game_review_vote" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isUpvote" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_review_vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "game_review_vote_reviewId_userId_key" ON "game_review_vote"("reviewId", "userId");

-- AddForeignKey
ALTER TABLE "game_review" ADD CONSTRAINT "game_review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_review_vote" ADD CONSTRAINT "game_review_vote_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "game_review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_review_vote" ADD CONSTRAINT "game_review_vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
