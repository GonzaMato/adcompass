// API Configuration
// Set NEXT_PUBLIC_USE_BACKEND=true to use external backend directly
// Otherwise, it uses the Next.js API routes (proxy)
const USE_BACKEND = process.env.NEXT_PUBLIC_USE_BACKEND === 'true';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_BASE_URL = USE_BACKEND ? BACKEND_URL : '/api';

// API Client helper
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

// Brand API endpoints
export const brandsAPI = {
  list: () => apiRequest<any[]>('/brands'),
  
  get: (id: string) => apiRequest<any>(`/brands/${id}`),
  
  create: (data: any) => 
    apiRequest<any>('/brands', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: any) =>
    apiRequest<any>(`/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    apiRequest<void>(`/brands/${id}`, {
      method: 'DELETE',
    }),
};
