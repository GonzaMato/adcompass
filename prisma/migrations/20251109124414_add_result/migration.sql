/*
  Warnings:

  - Added the required column `assetType` to the `evaluations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assetUrl` to the `evaluations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "evaluations" ADD COLUMN     "assetType" VARCHAR(10) NOT NULL,
ADD COLUMN     "assetUrl" VARCHAR(500) NOT NULL,
ADD COLUMN     "context" TEXT,
ALTER COLUMN "imageUrl" DROP NOT NULL;

-- CreateTable
CREATE TABLE "evaluation_results" (
    "id" UUID NOT NULL,
    "evaluationId" UUID NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluation_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_eval_results_evaluation_id" ON "evaluation_results"("evaluationId");

-- AddForeignKey
ALTER TABLE "evaluation_results" ADD CONSTRAINT "evaluation_results_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
