// Ejemplo: Cómo implementar un endpoint "real"
// Renombrá este archivo a route.ts cuando estés listo para usarlo

import { NextRequest, NextResponse } from 'next/server';

// GET /api/brands - Listar todas las marcas
export async function GET(request: NextRequest) {
  // Tu lógica aquí (puede ser DB, otro servicio, etc.)
  const brands = [
    {
      id: "00000000-0000-4000-8000-000000000001",
      name: "Belora",
      description: "Marca premium residencial costera.",
      createdAt: new Date().toISOString(),
    }
  ];
  
  return NextResponse.json(brands);
}

// POST /api/brands - Crear una nueva marca
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validación básica
    if (!body.name) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', message: 'Missing field: name' },
        { status: 400 }
      );
    }
    
    // Tu lógica de creación aquí
    const newBrand = {
      id: crypto.randomUUID(),
      name: body.name,
      description: body.description || '',
      colors: body.colors || [],
      logos: body.logos || [],
      taglinesAllowed: body.taglinesAllowed || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return NextResponse.json(newBrand, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to create brand' },
      { status: 500 }
    );
  }
}

