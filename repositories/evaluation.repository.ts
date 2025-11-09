import { PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { DatabaseError } from '../lib/errors';
import { EvaluateRequestDTO } from '../types/evaluation.types';

export interface EvaluationRecord {
  id: string;
  brandId: string;
  ruleId: string;
  assetUrl: string;
  assetType: 'IMAGE' | 'VIDEO';
  context?: string | null;
  imageUrl?: string | null;
  result: unknown;
  createdAt: Date;
}

export class EvaluationRepository {
  constructor(private db: PrismaClient = prisma) {}

  async create(input: EvaluateRequestDTO, result: unknown): Promise<EvaluationRecord> {
    try {
      const created = await this.db.evaluation.create({
        data: {
          brandId: input.brandId,
          ruleId: input.ruleId,
          assetUrl: input.assetUrl || input.imageUrl!,
          assetType: input.assetType || 'IMAGE',
          context: input.context ?? null,
          // Keep legacy imageUrl populated for image assets
          imageUrl: (input.assetType === 'IMAGE' || (!!input.imageUrl && !input.assetType))
            ? (input.assetUrl || input.imageUrl!)
            : null,
          result: result as any,
        },
      });
      return created as unknown as EvaluationRecord;
    } catch (error) {
      console.error('Database error creating evaluation:', error);
      throw new DatabaseError(
        `Failed to persist evaluation: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

export const evaluationRepository = new EvaluationRepository();


