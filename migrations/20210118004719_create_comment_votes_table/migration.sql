/*
  Warnings:

  - You are about to drop the column `votes` on the `comments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "comments" DROP COLUMN "votes",
ADD COLUMN     "upvotes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "downvotes" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "comment_votes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "comment_id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "value" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "comment_votes" ADD FOREIGN KEY("user_id")REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_votes" ADD FOREIGN KEY("comment_id")REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_votes" ADD FOREIGN KEY("site_id")REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_votes" ADD FOREIGN KEY("post_id")REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
