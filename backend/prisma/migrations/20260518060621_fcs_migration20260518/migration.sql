-- AlterTable
ALTER TABLE "AISignal" ADD COLUMN "edgePoints" REAL;
ALTER TABLE "AISignal" ADD COLUMN "fairProb" REAL;
ALTER TABLE "AISignal" ADD COLUMN "impliedProb" REAL;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Market" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question" TEXT NOT NULL,
    "category" TEXT,
    "countryCode" TEXT,
    "yesPrice" REAL,
    "noPrice" REAL,
    "volumeEur" REAL,
    "liquidityEur" REAL,
    "spread" REAL,
    "bestBid" REAL,
    "bestAsk" REAL,
    "clobTokenId" TEXT,
    "analyzable" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'active',
    "closesAt" DATETIME,
    "lastSynced" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Market" ("category", "closesAt", "countryCode", "id", "lastSynced", "liquidityEur", "noPrice", "question", "status", "volumeEur", "yesPrice") SELECT "category", "closesAt", "countryCode", "id", "lastSynced", "liquidityEur", "noPrice", "question", "status", "volumeEur", "yesPrice" FROM "Market";
DROP TABLE "Market";
ALTER TABLE "new_Market" RENAME TO "Market";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
