/*
  Warnings:

  - You are about to drop the column `upvotes` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `downvotes` on the `comments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "comments" DROP COLUMN "upvotes",
DROP COLUMN "downvotes";
