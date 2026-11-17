import { apiRequest } from './client'
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../../types/auth'

export function login(payload: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function register(payload: RegisterRequest): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>('/api/auth/registro', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
