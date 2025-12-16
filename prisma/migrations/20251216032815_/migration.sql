/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `PollOption` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PollOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    CONSTRAINT "PollOption_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PollOption" ("id", "pollId", "text") SELECT "id", "pollId", "text" FROM "PollOption";
DROP TABLE "PollOption";
ALTER TABLE "new_PollOption" RENAME TO "PollOption";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
