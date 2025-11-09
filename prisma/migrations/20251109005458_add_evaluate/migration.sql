-- CreateTable
CREATE TABLE "evaluations" (
    "id" UUID NOT NULL,
    "brandId" UUID NOT NULL,
    "ruleId" UUID NOT NULL,
    "imageUrl" VARCHAR(500) NOT NULL,
    "result" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_evaluations_brand_id" ON "evaluations"("brandId");

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;
