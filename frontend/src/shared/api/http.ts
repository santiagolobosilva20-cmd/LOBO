export interface ApiErrorPayload {
  error?: {
    code?: string;
    message?: string;
    errors?: Record<string, string[] | string>;
    timestamp?: string;
  };
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly fieldErrors: Record<string, string>;

  constructor({
    message,
    statusCode,
    code = 'api_error',
    fieldErrors = {},
  }: {
    message: string;
    statusCode: number;
    code?: string;
    fieldErrors?: Record<string, string>;
  }) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export function extractApiError(payload: ApiErrorPayload, statusCode: number): {
  message: string;
  code: string;
  fieldErrors: Record<string, string>;
  statusCode: number;
} {
  const fieldErrors: Record<string, string> = {};
  const rawErrors = payload.error?.errors;

  if (rawErrors && typeof rawErrors === 'object') {
    for (const [field, value] of Object.entries(rawErrors)) {
      if (Array.isArray(value) && value.length > 0) {
        fieldErrors[field] = String(value[0]);
      } else if (typeof value === 'string') {
        fieldErrors[field] = value;
      }
    }
  }

  return {
    statusCode,
    code: payload.error?.code ?? 'http_error',
    message:
      typeof payload.error?.message === 'string' && payload.error.message !== ''
        ? payload.error.message
        : `Error inesperado en el servidor (HTTP ${statusCode}).`,
    fieldErrors,
  };
}

export const API_BASE = '/api/v1';

export async function requestJson<T>(
  path: string,
  options: RequestInit = {},
  fetchImpl: typeof fetch = globalThis.fetch,
): Promise<T> {
  const response = await fetchImpl(`${API_BASE}${path}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json().catch(() => ({}))) as ApiErrorPayload & T;

  if (!response.ok) {
    throw new ApiError(extractApiError(payload, response.status));
  }

  return payload;
}

