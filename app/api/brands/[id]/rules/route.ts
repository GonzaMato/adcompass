import { NextRequest } from 'next/server';
import { brandRulesController } from '../../../../../controllers/brand-rules.controller';

// POST /api/brands/{id}/rules - Create rules for brand (fails if exists)
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return brandRulesController.create(request, id);
}

// GET /api/brands/{id}/rules - Get rules for brand
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return brandRulesController.getOne(request, id);
}

// PUT /api/brands/{id}/rules - Update rules for brand
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return brandRulesController.update(request, id);
}


