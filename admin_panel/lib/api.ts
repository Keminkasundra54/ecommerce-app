// lib/api.ts
'use client';
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient();
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}
export function setToken(token: string) { localStorage.setItem('token', token); }
export function clearToken() { localStorage.removeItem('token'); localStorage.removeItem('user'); }

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> || {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers, credentials: 'include' as RequestCredentials });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ✅ for multipart/form-data
export async function apiFetchForm<T>(path: string, form: FormData, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> || {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  }; // DON'T set Content-Type; browser sets boundary
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    ...init,
    headers,
    body: form,
    credentials: 'include' as RequestCredentials
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export type User = { id: string; name: string; email: string; role: 'admin' | 'user' };
