import { NextRequest } from 'next/server';
import { brandRulesController } from '../../../../../controllers/brand-rules.controller';

// POST /api/brands/{id}/rules - Create rules for brand
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return brandRulesController.create(request, id);
}

// GET /api/brands/{id}/rules - List rules for brand
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return brandRulesController.listByBrand(request, id);
}


