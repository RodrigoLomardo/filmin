import { createClient } from '../supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL não foi definida.');
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = RequestInit & {
  params?: Record<string, string | number | undefined>;
};

function buildUrl(path: string, params?: Record<string, string | number | undefined>) {
  const url = new URL(`${API_URL}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

async function getAccessToken(): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...rest } = options;

  const token = await getAccessToken();

  const authHeaders: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const response = await fetch(buildUrl(path, params), {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...headers,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    let message = 'Erro ao processar requisição';

    try {
      const errorBody = await response.json();
      message = errorBody.message || message;
    } catch { }

    throw new ApiError(response.status, Array.isArray(message) ? message.join(', ') : message);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}