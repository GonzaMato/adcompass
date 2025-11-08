import { PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { DatabaseError } from '../lib/errors';
import { CreateBrandData, BrandWithRelations } from '../types';

export class BrandRepository {
  constructor(private db: PrismaClient = prisma) {}

  async existsByName(name: string): Promise<boolean> {
    try {
      const brand = await this.db.brand.findUnique({
        where: { name },
      });
      return !!brand;
    } catch (error) {
      console.error('Database error in existsByName:', error);
      throw new DatabaseError(
        `Failed to check brand name: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async createWithRelations(data: CreateBrandData): Promise<BrandWithRelations> {
    try {
      const brand = await this.db.$transaction(async (tx: any) => {
        // Create brand
        const newBrand = await tx.brand.create({
          data: {
            name: data.name,
            description: data.description,
          },
        });

        // Create colors (if provided)
        if (data.colors && data.colors.length > 0) {
          await tx.color.createMany({
            data: data.colors.map((color) => ({
              brandId: newBrand.id,
              role: color.role,
              hex: color.hex,
              darkVariant: color.darkVariant,
              allowAsBackground: color.allowAsBackground ?? true,
            })),
          });
        }

        // Create logos
        if (data.logos && data.logos.length > 0) {
          await tx.logo.createMany({
            data: data.logos.map((logo) => ({
              brandId: newBrand.id,
              type: logo.type,
              url: logo.url,
              mime: logo.mime,
              sizeBytes: logo.sizeBytes,
              widthPx: logo.widthPx,
              heightPx: logo.heightPx,
              minClearSpaceRatio: logo.minClearSpaceRatio,
              allowedPositions: logo.allowedPositions,
              bannedBackgrounds: logo.bannedBackgrounds,
              monochrome: logo.monochrome,
              invertOnDark: logo.invertOnDark,
            })),
          });
        }

        // Create taglines
        if (data.taglines && data.taglines.length > 0) {
          await tx.tagline.createMany({
            data: data.taglines.map((text) => ({
              brandId: newBrand.id,
              text,
            })),
          });
        }

        // Return complete brand with relations
        return tx.brand.findUnique({
          where: { id: newBrand.id },
          include: {
            colors: true,
            logos: true,
            taglines: true,
          },
        });
      });

      if (!brand) {
        throw new DatabaseError('Failed to create brand');
      }

      return brand;
    } catch (error) {
      console.error('Database error in createWithRelations:', error);
      
      // Check for unique constraint violation (Prisma error code P2002)
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        throw new DatabaseError('A brand with this name already exists');
      }
      
      throw new DatabaseError(
        `Failed to create brand: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findById(id: string): Promise<BrandWithRelations | null> {
    try {
      return await this.db.brand.findUnique({
        where: { id },
        include: {
          colors: true,
          logos: true,
          taglines: true,
        },
      });
    } catch (error) {
      console.error('Database error in findById:', error);
      throw new DatabaseError(
        `Failed to find brand: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findAll(): Promise<BrandWithRelations[]> {
    try {
      return await this.db.brand.findMany({
        include: {
          colors: true,
          logos: true,
          taglines: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.error('Database error in findAll:', error);
      throw new DatabaseError(
        `Failed to fetch brands: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.db.brand.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Database error in delete:', error);
      throw new DatabaseError(
        `Failed to delete brand: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

export const brandRepository = new BrandRepository();

