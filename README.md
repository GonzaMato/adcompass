# AdCompass

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Mock OpenAPI Gateway

Este proyecto incluye un gateway de desarrollo integrado en Next.js que permite "desmockear" endpoints progresivamente a medida que el backend los implementa, sin cambiar código del frontend.

### Arquitectura

- **OpenAPI Spec** (`openapi/openapi.yaml`) - Contrato único de la API
- **Mock Server** (Prism en puerto 4010) - Genera respuestas mock desde el OpenAPI spec
- **Real Backend** (puerto 8080) - Implementación real del backend
- **Next.js API Routes** (`/api/*`) - Proxy inteligente que rutea a mock o real según configuración

### Quick Start

#### Opción A: Con Docker (Recomendado)

```bash
# Levantar todo (Next.js + Mock + Postgres)
docker compose up

# O en background
docker compose up -d

# Ver logs
docker compose logs -f app
docker compose logs -f mock
```

Esto levanta:
- Next.js en `http://localhost:3000` (incluye el proxy en `/api/*`)
- Prism mock server en `http://localhost:4010`
- PostgreSQL en `localhost:5432`

#### Opción B: Local (sin Docker)

1. **Instalar dependencias:**

```bash
npm install
```

2. **Ejecutar todo junto (Next.js + Mock):**

```bash
npm run dev:all
```

Esto levanta:
- Next.js en `http://localhost:3000` (incluye el proxy en `/api/*`)
- Prism mock server en `http://localhost:4010`

3. **O ejecutar por separado:**

Terminal 1:
```bash
npm run dev:mock
```

Terminal 2:
```bash
npm run dev
```

### Usar el API Gateway

En tu frontend, consume las rutas así:

```typescript
// Configuración del cliente API
const API_BASE_URL = '/api';  // ¡Siempre apunta al proxy de Next.js!

// Ejemplos de uso
fetch(`${API_BASE_URL}/brands`);
fetch(`${API_BASE_URL}/brands/123`);
fetch(`${API_BASE_URL}/evaluate`, { method: 'POST', ... });
```

El proxy de Next.js decide automáticamente si cada endpoint va a mock o real según la configuración.

### Progressive Unmocking (Desmockeo 1 a 1)

El sistema usa `routes.json` para controlar qué endpoints están en mock vs implementados:

```json
{
  "GET /brands": "mock",        // Proxy a Prism
  "POST /brands": "real",       // Debe estar implementado en Next.js
  "GET /brands/{id}": "mock",
  "POST /evaluate": "mock"
}
```

#### Workflow de implementación:

1. **Inicialmente todo en "mock"**: El catch-all proxy redirige todo a Prism
2. **Cuando implementás un endpoint**:
   - Cambiá en `routes.json`: `"POST /brands": "real"`
   - Creá el archivo: `app/api/brands/route.ts`
   - Implementá el handler `export async function POST() { ... }`
3. **Next.js prioriza rutas específicas** sobre el catch-all automáticamente

**Ejemplo de implementación real:**

```typescript
// app/api/brands/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  // Tu lógica aquí
  return NextResponse.json({ id: '123', name: body.name });
}
```

**¡Importante!** Para que los cambios en `routes.json` tomen efecto, reiniciá el servidor Next.js (`Ctrl+C` y `npm run dev`).

### Variables de Entorno

Puedes personalizar el comportamiento con esta variable en `.env.local`:

- `MOCK_BASE_URL` - URL del mock server (default: `http://localhost:4010`)
- `N8N_EVALUATE_URL` - URL del workflow de n8n para evaluar (POST)
- `N8N_FIX_URL` - URL del workflow de n8n para corregir (POST)
- `EVALUATE_TIMEOUT_MS` - (opcional) timeout para evaluar, en ms (default: 12000)
- `FIX_TIMEOUT_MS` - (opcional) timeout para corregir, en ms (default: 12000)

Ejemplo `.env.local`:

```bash
MOCK_BASE_URL=http://localhost:4010
N8N_EVALUATE_URL=https://n8n.example.com/webhook/evaluate
N8N_FIX_URL=https://n8n.example.com/webhook/fix
EVALUATE_TIMEOUT_MS=12000
FIX_TIMEOUT_MS=12000
```

### Endpoints Disponibles

Definidos en `openapi/openapi.yaml`:

- `GET /api/brands` - Listar marcas
- `POST /api/brands` - Crear marca
- `GET /api/brands/{id}` - Obtener marca por ID
- `POST /api/evaluate` - Evaluar

### Ejemplo de Workflow

1. **Día 1:** Todos los endpoints en `routes.json` están en `"mock"`. Frontend trabaja con datos simulados.

2. **Día 3:** Backend implementa `POST /brands`. Cambias en `routes.json`:
   ```json
   "POST /brands": "real"
   ```

3. **Día 5:** Backend implementa `GET /brands`. Cambias en `routes.json`:
   ```json
   "GET /brands": "real"
   ```

4. **Día 7:** Todos los endpoints están en "real". El frontend nunca cambió sus URLs.

## Next.js Development

Run the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
