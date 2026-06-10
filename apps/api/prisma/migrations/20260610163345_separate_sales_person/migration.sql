/*
  Warnings:

  - You are about to drop the column `salesExecutiveId` on the `Sale` table. All the data in the column will be lost.
  - Added the required column `salesPersonId` to the `Sale` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "SalesPerson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "salesPersonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Sale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "saleNumber" TEXT NOT NULL,
    "saleDate" DATETIME NOT NULL,
    "customerId" TEXT NOT NULL,
    "softwarePrice" REAL NOT NULL,
    "monthlyCharge" REAL NOT NULL,
    "advanceAmount" REAL NOT NULL,
    "dueAmount" REAL NOT NULL,
    "salesPersonId" TEXT NOT NULL,
    "remarks" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Sale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sale_salesPersonId_fkey" FOREIGN KEY ("salesPersonId") REFERENCES "SalesPerson" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Sale" ("advanceAmount", "createdAt", "customerId", "dueAmount", "id", "monthlyCharge", "remarks", "saleDate", "saleNumber", "softwarePrice", "updatedAt") SELECT "advanceAmount", "createdAt", "customerId", "dueAmount", "id", "monthlyCharge", "remarks", "saleDate", "saleNumber", "softwarePrice", "updatedAt" FROM "Sale";
DROP TABLE "Sale";
ALTER TABLE "new_Sale" RENAME TO "Sale";
CREATE UNIQUE INDEX "Sale_saleNumber_key" ON "Sale"("saleNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "SalesPerson_salesPersonId_key" ON "SalesPerson"("salesPersonId");
