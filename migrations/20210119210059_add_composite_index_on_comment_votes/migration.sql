/*
  Warnings:

  - The migration will add a unique constraint covering the columns `[comment_id,user_id]` on the table `comment_votes`. If there are existing duplicate values, the migration will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "comment_votes.comment_id_user_id_unique" ON "comment_votes"("comment_id", "user_id");
