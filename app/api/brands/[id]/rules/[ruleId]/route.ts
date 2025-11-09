import { NextRequest } from 'next/server';
import { brandRulesController } from '../../../../../../controllers/brand-rules.controller';

// GET /api/brands/{id}/rules/{ruleId} - Get rule by id
export async function GET(request: NextRequest, context: { params: Promise<{ id: string; ruleId: string }> }) {
  const { id, ruleId } = await context.params;
  return brandRulesController.getById(request, id, ruleId);
}

// PUT /api/brands/{id}/rules/{ruleId} - Update rule by id
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string; ruleId: string }> }) {
  const { id, ruleId } = await context.params;
  return brandRulesController.updateById(request, id, ruleId);
}

// DELETE /api/brands/{id}/rules/{ruleId} - Delete rule by id
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string; ruleId: string }> }) {
  const { id, ruleId } = await context.params;
  return brandRulesController.deleteById(request, id, ruleId);
}


