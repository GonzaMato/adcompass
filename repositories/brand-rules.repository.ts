import { PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { DatabaseError } from '../lib/errors';
import { BrandRulesInput } from '../lib/rules.schema';

export interface BrandRulesRecord {
  id: string;
  brandId: string;
  rules: BrandRulesInput;
  createdAt: Date;
  updatedAt: Date;
}

export class BrandRulesRepository {
  constructor(private db: PrismaClient = prisma) {}

  async findByBrandId(brandId: string): Promise<BrandRulesRecord | null> {
    try {
      return await this.db.brandRules.findUnique({
        where: { brandId },
      }) as unknown as BrandRulesRecord | null;
    } catch (error) {
      console.error('Database error in findByBrandId:', error);
      throw new DatabaseError(`Failed to find brand rules: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAll(): Promise<BrandRulesRecord[]> {
    try {
      return await this.db.brandRules.findMany({
        orderBy: { updatedAt: 'desc' },
      }) as unknown as BrandRulesRecord[];
    } catch (error) {
      console.error('Database error in findAll brand rules:', error);
      throw new DatabaseError(`Failed to fetch brand rules: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async create(brandId: string, rules: unknown): Promise<BrandRulesRecord> {
    try {
      return await this.db.brandRules.create({
        data: { brandId, rules },
      }) as unknown as BrandRulesRecord;
    } catch (error) {
      console.error('Database error in create brand rules:', error);
      throw new DatabaseError(`Failed to create brand rules: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateByBrandId(brandId: string, rules: unknown): Promise<BrandRulesRecord> {
    try {
      return await this.db.brandRules.update({
        where: { brandId },
        data: { rules },
      }) as unknown as BrandRulesRecord;
    } catch (error) {
      console.error('Database error in update brand rules:', error);
      throw new DatabaseError(`Failed to update brand rules: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const brandRulesRepository = new BrandRulesRepository();


