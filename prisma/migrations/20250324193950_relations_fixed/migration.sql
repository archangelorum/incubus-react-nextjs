-- DropForeignKey
ALTER TABLE "blockchain_index" DROP CONSTRAINT "blockchain_index_blockchainId_fkey";

-- DropForeignKey
ALTER TABLE "developer_game" DROP CONSTRAINT "developer_game_developerId_fkey";

-- DropForeignKey
ALTER TABLE "developer_game" DROP CONSTRAINT "developer_game_gameId_fkey";

-- DropForeignKey
ALTER TABLE "escrow_transaction" DROP CONSTRAINT "escrow_transaction_escrowId_fkey";

-- DropForeignKey
ALTER TABLE "escrow_transaction" DROP CONSTRAINT "escrow_transaction_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "game_genre" DROP CONSTRAINT "game_genre_gameId_fkey";

-- DropForeignKey
ALTER TABLE "game_genre" DROP CONSTRAINT "game_genre_genreId_fkey";

-- DropForeignKey
ALTER TABLE "game_item" DROP CONSTRAINT "game_item_gameId_fkey";

-- DropForeignKey
ALTER TABLE "game_license" DROP CONSTRAINT "game_license_walletId_fkey";

-- DropForeignKey
ALTER TABLE "game_license_transaction" DROP CONSTRAINT "game_license_transaction_licenseeId_fkey";

-- DropForeignKey
ALTER TABLE "game_license_transaction" DROP CONSTRAINT "game_license_transaction_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "game_review" DROP CONSTRAINT "game_review_gameId_fkey";

-- DropForeignKey
ALTER TABLE "game_review" DROP CONSTRAINT "game_review_userId_fkey";

-- DropForeignKey
ALTER TABLE "game_tag" DROP CONSTRAINT "game_tag_gameId_fkey";

-- DropForeignKey
ALTER TABLE "game_tag" DROP CONSTRAINT "game_tag_tagId_fkey";

-- DropForeignKey
ALTER TABLE "game_version" DROP CONSTRAINT "game_version_gameId_fkey";

-- DropForeignKey
ALTER TABLE "item_ownership" DROP CONSTRAINT "item_ownership_itemId_fkey";

-- DropForeignKey
ALTER TABLE "item_ownership" DROP CONSTRAINT "item_ownership_walletId_fkey";

-- DropForeignKey
ALTER TABLE "item_tag" DROP CONSTRAINT "item_tag_itemId_fkey";

-- DropForeignKey
ALTER TABLE "item_tag" DROP CONSTRAINT "item_tag_tagId_fkey";

-- DropForeignKey
ALTER TABLE "item_transaction" DROP CONSTRAINT "item_transaction_itemId_fkey";

-- DropForeignKey
ALTER TABLE "item_transaction" DROP CONSTRAINT "item_transaction_ownershipId_fkey";

-- DropForeignKey
ALTER TABLE "item_transaction" DROP CONSTRAINT "item_transaction_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "proposal_vote" DROP CONSTRAINT "proposal_vote_proposalId_fkey";

-- DropForeignKey
ALTER TABLE "publisher_wallet" DROP CONSTRAINT "publisher_wallet_publisherId_fkey";

-- DropForeignKey
ALTER TABLE "shard" DROP CONSTRAINT "shard_shardConfigId_fkey";

-- DropForeignKey
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_walletId_fkey";

-- DropForeignKey
ALTER TABLE "user_consent" DROP CONSTRAINT "user_consent_policyId_fkey";

-- RenameForeignKey
ALTER TABLE "game_review_vote" RENAME CONSTRAINT "game_review_vote_userId_fkey" TO "gameReviewVotes";

-- AddForeignKey
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publisher" ADD CONSTRAINT "publisher_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publisher_wallet" ADD CONSTRAINT "publisher_wallet_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "publisher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "developer" ADD CONSTRAINT "developer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "developer_game" ADD CONSTRAINT "developer_game_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "developer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "developer_game" ADD CONSTRAINT "developer_game_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_version" ADD CONSTRAINT "game_version_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_genre" ADD CONSTRAINT "game_genre_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_genre" ADD CONSTRAINT "game_genre_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_tag" ADD CONSTRAINT "game_tag_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_tag" ADD CONSTRAINT "game_tag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_license" ADD CONSTRAINT "game_license_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_license_transaction" ADD CONSTRAINT "game_license_transaction_licenseeId_fkey" FOREIGN KEY ("licenseeId") REFERENCES "game_license"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_license_transaction" ADD CONSTRAINT "game_license_transaction_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_license_transaction" ADD CONSTRAINT "game_license_transaction_fromWalletId_fkey" FOREIGN KEY ("fromWalletId") REFERENCES "wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_license_transaction" ADD CONSTRAINT "game_license_transaction_toWalletId_fkey" FOREIGN KEY ("toWalletId") REFERENCES "wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_item" ADD CONSTRAINT "game_item_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_tag" ADD CONSTRAINT "item_tag_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "game_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_tag" ADD CONSTRAINT "item_tag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_ownership" ADD CONSTRAINT "item_ownership_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "game_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_ownership" ADD CONSTRAINT "item_ownership_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_transaction" ADD CONSTRAINT "item_transaction_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "game_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_transaction" ADD CONSTRAINT "item_transaction_ownershipId_fkey" FOREIGN KEY ("ownershipId") REFERENCES "item_ownership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_transaction" ADD CONSTRAINT "item_transaction_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_transaction" ADD CONSTRAINT "item_transaction_fromWalletId_fkey" FOREIGN KEY ("fromWalletId") REFERENCES "wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_transaction" ADD CONSTRAINT "item_transaction_toWalletId_fkey" FOREIGN KEY ("toWalletId") REFERENCES "wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_listing" ADD CONSTRAINT "marketplace_listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrow_transaction" ADD CONSTRAINT "escrow_transaction_escrowId_fkey" FOREIGN KEY ("escrowId") REFERENCES "escrow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrow_transaction" ADD CONSTRAINT "escrow_transaction_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_review" ADD CONSTRAINT "game_review_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_review" ADD CONSTRAINT "game_review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_event" ADD CONSTRAINT "analytics_event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockchain_index" ADD CONSTRAINT "blockchain_index_blockchainId_fkey" FOREIGN KEY ("blockchainId") REFERENCES "blockchain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "governance_proposal" ADD CONSTRAINT "governance_proposal_proposerId_fkey" FOREIGN KEY ("proposerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_vote" ADD CONSTRAINT "proposal_vote_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "governance_proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_vote" ADD CONSTRAINT "proposal_vote_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute_case" ADD CONSTRAINT "dispute_case_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute_case" ADD CONSTRAINT "dispute_case_defenderId_fkey" FOREIGN KEY ("defenderId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute_case" ADD CONSTRAINT "dispute_case_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shard" ADD CONSTRAINT "shard_shardConfigId_fkey" FOREIGN KEY ("shardConfigId") REFERENCES "shard_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_consent" ADD CONSTRAINT "user_consent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_consent" ADD CONSTRAINT "user_consent_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "compliance_policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
