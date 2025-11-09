// API Configuration
// Set NEXT_PUBLIC_USE_BACKEND=true to use external backend directly
// Otherwise, it uses the Next.js API routes (proxy)
const USE_BACKEND = process.env.NEXT_PUBLIC_USE_BACKEND === 'true';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_BASE_URL = USE_BACKEND ? BACKEND_URL : '/api';

// API Client helper for JSON requests
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

// API Client helper for FormData requests (multipart)
export async function apiFormRequest<T>(
  endpoint: string,
  formData: FormData,
  method: 'POST' | 'PUT' = 'POST'
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method,
    body: formData,
    // Don't set Content-Type header - browser will set it with boundary
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
  
  create: (formData: FormData) => apiFormRequest<any>('/brands', formData),
  
  update: (id: string, formData: FormData) =>
    apiFormRequest<any>(`/brands/${id}`, formData, 'PUT'),
  
  delete: (id: string) =>
    apiRequest<void>(`/brands/${id}`, {
      method: 'DELETE',
    }),
};
