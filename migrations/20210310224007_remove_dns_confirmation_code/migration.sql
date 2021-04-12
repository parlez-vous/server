/*
  Warnings:

  - You are about to drop the column `dns_tag` on the `sites` table. All the data in the column will be lost.
  - You are about to drop the constraint `dns_tag_unique` on the `sites` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `sites` table. All the data in the column will be lost.

*/
ALTER TABLE "sites" DROP COLUMN "dns_tag",
DROP COLUMN "verified";
