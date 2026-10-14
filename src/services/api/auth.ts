import { apiRequest } from './client'
import type { AuthResponse, LoginRequest, ProfileResponse, RegisterRequest } from '../../types/auth'

export function login(payload: LoginRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function register(payload: RegisterRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/registro', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getProfile(token: string): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>('/api/auth/perfil', {
    headers: { Authorization: `Bearer ${token}` },
  })
}
