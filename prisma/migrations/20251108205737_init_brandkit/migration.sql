-- CreateTable
CREATE TABLE "brands" (
    "id" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "description" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colors" (
    "id" SERIAL NOT NULL,
    "brand_id" UUID NOT NULL,
    "role" VARCHAR(50),
    "hex" CHAR(7) NOT NULL,
    "dark_variant" CHAR(7),
    "allow_as_background" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "colors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logos" (
    "id" SERIAL NOT NULL,
    "brand_id" UUID NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "mime" VARCHAR(30) NOT NULL,
    "size_bytes" INTEGER,
    "width_px" INTEGER,
    "height_px" INTEGER,
    "min_clear_space_ratio" DOUBLE PRECISION,
    "allowed_positions" JSONB,
    "banned_backgrounds" JSONB,
    "monochrome" JSONB,
    "invert_on_dark" BOOLEAN,

    CONSTRAINT "logos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taglines" (
    "id" SERIAL NOT NULL,
    "brand_id" UUID NOT NULL,
    "text" VARCHAR(120) NOT NULL,

    CONSTRAINT "taglines_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "colors" ADD CONSTRAINT "colors_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logos" ADD CONSTRAINT "logos_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taglines" ADD CONSTRAINT "taglines_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;
