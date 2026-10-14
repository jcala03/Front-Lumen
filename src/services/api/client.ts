export type ApiErrorPayload = {
  error?: string
  code?: string
  fields?: Record<string, string>
}

export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly fields?: Record<string, string>

  constructor(
    message: string,
    status: number,
    code?: string,
    fields?: Record<string, string>,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
  }
}

const getBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
  if (!baseUrl) {
    throw new Error('VITE_API_BASE_URL is not configured.')
  }
  return baseUrl.replace(/\/+$/, '')
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${getBaseUrl()}/${path.replace(/^\/+/, '')}`
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, { ...init, headers })
  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get('content-type') ?? ''
  const payload: unknown = contentType.includes('application/json')
    ? await response.json()
    : undefined

  if (!response.ok) {
    const errorPayload = payload && typeof payload === 'object'
      ? payload as ApiErrorPayload
      : undefined
    throw new ApiError(
      errorPayload?.error ?? `Request failed with status ${response.status}.`,
      response.status,
      errorPayload?.code,
      errorPayload?.fields,
    )
  }

  return payload as T
}
