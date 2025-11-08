import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// Environment variables with defaults
const MOCK_BASE_URL = process.env.MOCK_BASE_URL || 'http://localhost:4010';

// Routes configuration path
const ROUTES_CONFIG_PATH = path.join(process.cwd(), 'routes.json');

interface RoutesConfig {
  [key: string]: 'mock' | 'real';
}

// Load routes config once at startup
function loadRoutesConfig(): RoutesConfig {
  try {
    const configContent = fs.readFileSync(ROUTES_CONFIG_PATH, 'utf-8');
    const config = JSON.parse(configContent);
    console.log('📋 Routes configuration loaded:', config);
    return config;
  } catch (error) {
    console.error('Error loading routes.json:', error);
    console.log('Using default configuration (all routes to mock)');
    return {};
  }
}

// Load configuration once at module initialization
const routesConfig = loadRoutesConfig();

function getRouteConfig(method: string, pathname: string): 'mock' | 'real' {
  
  // Try exact match: "METHOD /path"
  const exactKey = `${method} ${pathname}`;
  if (routesConfig[exactKey]) {
    return routesConfig[exactKey];
  }
  
  // Try path-only match: "/path"
  if (routesConfig[pathname]) {
    return routesConfig[pathname];
  }
  
  // Try prefix match for parameterized routes like /brands/{id}
  for (const [key, target] of Object.entries(routesConfig)) {
    const keyParts = key.split(' ');
    const routeMethod = keyParts.length > 1 ? keyParts[0] : null;
    const routePath = keyParts.length > 1 ? keyParts[1] : key;
    
    // Convert OpenAPI path params to regex: /brands/{id} -> /brands/[^/]+
    const regexPattern = routePath.replace(/\{[^}]+\}/g, '[^/]+');
    const regex = new RegExp(`^${regexPattern}$`);
    
    if (regex.test(pathname)) {
      if (routeMethod && routeMethod !== method) {
        continue;
      }
      return target;
    }
  }
  
  // Default to mock
  return 'mock';
}

async function proxyRequest(request: NextRequest, pathname: string) {
  const method = request.method;
  const routeConfig = getRouteConfig(method, pathname);
  
  // If route is marked as "real", it should be implemented as a specific route
  // This catch-all should not handle it
  if (routeConfig === 'real') {
    console.log(`[${new Date().toISOString()}] ${method} ${pathname} -> REAL (not implemented)`);
    return NextResponse.json(
      {
        error: 'Not Implemented',
        message: `This endpoint is marked as "real" in routes.json but not yet implemented. Create the specific route at: app/api${pathname}/route.ts`,
        endpoint: `${method} ${pathname}`,
      },
      { status: 501 }
    );
  }
  
  // Route to mock server
  const targetEndpoint = `${MOCK_BASE_URL}${pathname}`;
  console.log(`[${new Date().toISOString()}] ${method} ${pathname} -> MOCK (${MOCK_BASE_URL})`);
  
  try {
    // Prepare headers
    const headers: HeadersInit = {};
    request.headers.forEach((value, key) => {
      // Skip some headers that shouldn't be forwarded
      if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });
    
    // Prepare body for non-GET requests
    let body: string | undefined;
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        body = await request.text();
      } catch (error) {
        console.error('Error reading request body:', error);
      }
    }
    
    // Forward request
    const response = await fetch(targetEndpoint, {
      method,
      headers,
      body,
    });
    
    // Get response body
    const responseData = await response.text();
    
    // Create response with same status and headers
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });
    
    console.log(`  ← ${response.status} from MOCK`);
    
    return new NextResponse(responseData, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      {
        error: 'Bad Gateway',
        message: 'Failed to proxy request to mock server',
        target: MOCK_BASE_URL,
      },
      { status: 502 }
    );
  }
}

// Handle all HTTP methods
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  const pathname = '/' + (params.path?.join('/') || '');
  return proxyRequest(request, pathname);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  const pathname = '/' + (params.path?.join('/') || '');
  return proxyRequest(request, pathname);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  const pathname = '/' + (params.path?.join('/') || '');
  return proxyRequest(request, pathname);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  const pathname = '/' + (params.path?.join('/') || '');
  return proxyRequest(request, pathname);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  const pathname = '/' + (params.path?.join('/') || '');
  return proxyRequest(request, pathname);
}

