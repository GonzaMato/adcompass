import { brandRulesRepository, BrandRulesRecord } from '../repositories/brand-rules.repository';
import { ConflictError, DatabaseError, NotFoundError, ValidationError } from '../lib/errors';
import { parseRulesBody, validateRules, BrandRulesInput } from '../lib/rules.schema';

export class BrandRulesService {
  constructor(private repo = brandRulesRepository) {}

  async createRules(brandId: string, rawBody: string, contentType: string | null | undefined): Promise<BrandRulesRecord> {
    try {
      const data = parseRulesBody(rawBody, contentType);
      const rules = validateRules(data);

      const existing = await this.repo.findByBrandId(brandId);
      if (existing) {
        throw new ConflictError('Rules already exist for this brand');
      }

      return await this.repo.create(brandId, rules);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof ConflictError) {
        throw error;
      }
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Failed to create rules: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRules(brandId: string): Promise<BrandRulesRecord> {
    const found = await this.repo.findByBrandId(brandId);
    if (!found) {
      throw new NotFoundError('Brand rules not found');
    }
    return found;
  }

  async updateRules(brandId: string, rawBody: string, contentType: string | null | undefined): Promise<BrandRulesRecord> {
    try {
      const data = parseRulesBody(rawBody, contentType);
      const rules: BrandRulesInput = validateRules(data);

      const existing = await this.repo.findByBrandId(brandId);
      if (!existing) {
        throw new NotFoundError('Brand rules not found');
      }

      return await this.repo.updateByBrandId(brandId, rules);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Failed to update rules: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listAll(): Promise<BrandRulesRecord[]> {
    return this.repo.findAll();
  }
}

export const brandRulesService = new BrandRulesService();


