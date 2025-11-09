import { brandRulesRepository, BrandRulesRecord } from '../repositories/brand-rules.repository';
import { ConflictError, DatabaseError, NotFoundError, ValidationError } from '../lib/errors';
import { parseRulesBody, validateRules, BrandRulesInput } from '../lib/rules.schema';

export class BrandRulesService {
  constructor(private repo = brandRulesRepository) {}

  async createRules(brandId: string, rawBody: string, contentType: string | null | undefined): Promise<BrandRulesRecord> {
    try {
      const data = parseRulesBody(rawBody, contentType);
      const rules = validateRules(data);

      return await this.repo.create(brandId, rules);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Failed to create rules: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listByBrand(brandId: string): Promise<BrandRulesRecord[]> {
    return await this.repo.findByBrandId(brandId);
  }

  async getById(brandId: string, ruleId: string): Promise<BrandRulesRecord> {
    const found = await this.repo.findById(ruleId);
    if (!found || found.brandId !== brandId) {
      throw new NotFoundError('Brand rule not found');
    }
    return found;
  }

  async updateById(brandId: string, ruleId: string, rawBody: string, contentType: string | null | undefined): Promise<BrandRulesRecord> {
    try {
      const data = parseRulesBody(rawBody, contentType);
      const rules: BrandRulesInput = validateRules(data);

      const existing = await this.repo.findById(ruleId);
      if (!existing || existing.brandId !== brandId) {
        throw new NotFoundError('Brand rule not found');
      }

      return await this.repo.updateById(ruleId, rules);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Failed to update rule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listAll(): Promise<BrandRulesRecord[]> {
    return this.repo.findAll();
  }

  async deleteById(brandId: string, ruleId: string): Promise<void> {
    const existing = await this.repo.findById(ruleId);
    if (!existing || existing.brandId !== brandId) {
      throw new NotFoundError('Brand rule not found');
    }
    await this.repo.deleteById(ruleId);
  }
}

export const brandRulesService = new BrandRulesService();


