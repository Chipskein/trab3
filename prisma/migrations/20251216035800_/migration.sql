-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Poll" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME,
    "expectedVotes" INTEGER,
    "categories" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Poll_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Poll" ("categories", "createdAt", "createdById", "description", "endAt", "expectedVotes", "id", "startAt", "status", "title", "updatedAt", "visibility") SELECT "categories", "createdAt", "createdById", "description", "endAt", "expectedVotes", "id", "startAt", "status", "title", "updatedAt", "visibility" FROM "Poll";
DROP TABLE "Poll";
ALTER TABLE "new_Poll" RENAME TO "Poll";
CREATE INDEX "Poll_status_idx" ON "Poll"("status");
CREATE INDEX "Poll_visibility_idx" ON "Poll"("visibility");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
