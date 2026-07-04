-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('student', 'staff', 'admin');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('open', 'claimed', 'closed');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('lost', 'found');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "nim" TEXT,
    "faculty" TEXT,
    "phone" TEXT,
    "avatar_url" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'student',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lost_items" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "last_seen_at" TIMESTAMPTZ,
    "last_seen_loc" TEXT,
    "photo_url" TEXT,
    "status" "ItemStatus" NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "lost_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "found_items" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "found_at" TIMESTAMPTZ,
    "found_loc" TEXT,
    "storage_loc" TEXT,
    "photo_url" TEXT,
    "status" "ItemStatus" NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "found_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claim_requests" (
    "id" UUID NOT NULL,
    "claimant_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "item_type" "ItemType" NOT NULL,
    "proof_text" TEXT,
    "proof_photo_url" TEXT,
    "status" "ClaimStatus" NOT NULL DEFAULT 'pending',
    "admin_note" TEXT,
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "claim_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_nim_key" ON "profiles"("nim");

-- CreateIndex
CREATE INDEX "lost_items_status_idx" ON "lost_items"("status");

-- CreateIndex
CREATE INDEX "lost_items_category_idx" ON "lost_items"("category");

-- CreateIndex
CREATE INDEX "lost_items_created_at_idx" ON "lost_items"("created_at");

-- CreateIndex
CREATE INDEX "found_items_status_idx" ON "found_items"("status");

-- CreateIndex
CREATE INDEX "found_items_category_idx" ON "found_items"("category");

-- CreateIndex
CREATE INDEX "found_items_created_at_idx" ON "found_items"("created_at");

-- CreateIndex
CREATE INDEX "claim_requests_status_idx" ON "claim_requests"("status");

-- CreateIndex
CREATE INDEX "claim_requests_item_id_idx" ON "claim_requests"("item_id");

-- AddForeignKey
ALTER TABLE "lost_items" ADD CONSTRAINT "lost_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "found_items" ADD CONSTRAINT "found_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_requests" ADD CONSTRAINT "claim_requests_claimant_id_fkey" FOREIGN KEY ("claimant_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_requests" ADD CONSTRAINT "claim_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
