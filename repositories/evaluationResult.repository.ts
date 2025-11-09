import { PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { DatabaseError } from '../lib/errors';

export interface EvaluationResultRecord {
  id: string;
  evaluationId: string;
  url: string;
  payload?: unknown | null;
  createdAt: Date;
}

export class EvaluationResultRepository {
  constructor(private db: PrismaClient = prisma) {}

  async create(evaluationId: string, url: string, payload?: unknown): Promise<EvaluationResultRecord> {
    try {
      const created = await this.db.evaluationResult.create({
        data: {
          evaluationId,
          url,
          payload: payload as any,
        },
      });
      return created as unknown as EvaluationResultRecord;
    } catch (error) {
      console.error('Database error creating evaluation result:', error);
      throw new DatabaseError(
        `Failed to persist evaluation result: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async listByEvaluationId(evaluationId: string): Promise<EvaluationResultRecord[]> {
    try {
      const rows = await this.db.evaluationResult.findMany({
        where: { evaluationId },
        orderBy: { createdAt: 'desc' },
      });
      return rows as unknown as EvaluationResultRecord[];
    } catch (error) {
      console.error('Database error fetching evaluation results:', error);
      throw new DatabaseError(
        `Failed to load evaluation results: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

export const evaluationResultRepository = new EvaluationResultRepository();


