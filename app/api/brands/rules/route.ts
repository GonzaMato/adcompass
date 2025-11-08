import { brandRulesController } from '../../../../controllers/brand-rules.controller';

// GET /api/brands/rules - List all brand rules
export async function GET() {
  return brandRulesController.listAll();
}


