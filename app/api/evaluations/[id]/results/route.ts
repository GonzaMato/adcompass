import { NextRequest, NextResponse } from 'next/server';
import { evaluationResultRepository } from '../../../../../repositories/evaluationResult.repository';
import { DatabaseError, ValidationError } from '../../../../../lib/errors';

export async function GET(
  _request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const { id: evaluationId } = await Promise.resolve(context.params);
  try {
    if (!evaluationId || typeof evaluationId !== 'string') {
      throw new ValidationError('Missing or invalid evaluationId', 'id');
    }
    const results = await evaluationResultRepository.listByEvaluationId(evaluationId);
    return NextResponse.json({ results }, { status: 200 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { code: error.code, message: error.message, field: error.field },
        { status: 400 }
      );
    }
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { code: error.code, message: error.message },
        { status: 500 }
      );
    }

    const code = (error as any)?.code as string | undefined;
    if (code === 'BAD_REQUEST') {
      return NextResponse.json(
        { code: 'BAD_REQUEST', message: (error as any)?.message || 'Bad request' },
        { status: 400 }
      );
    }
    if (code === 'DATABASE_ERROR') {
      return NextResponse.json(
        { code: 'DATABASE_ERROR', message: (error as any)?.message || 'Database error' },
        { status: 500 }
      );
    }
    console.error('Unexpected error in GET /api/evaluations/[id]/results:', error);
    return NextResponse.json(
      { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}