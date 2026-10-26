const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

export class ApiError extends Error {
  status: number;
  code: string;
  details?: { path: string; message: string }[];

  constructor(status: number, code: string, message: string, details?: { path: string; message: string }[]) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }

  fieldError(field: string): string | undefined {
    return this.details?.find((d) => d.path === field || d.path.endsWith(`.${field}`))?.message;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
}

function fallbackMessage(status: number): string {
  if (status === 0) return 'Cannot reach the server. Check your connection and try again.';
  if (status === 404) return 'API endpoint not found. The app is pointing at the wrong server.';
  if (status === 502 || status === 503 || status === 504) {
    return 'The server is starting up or unavailable. Please try again in a moment.';
  }
  if (status >= 500) return 'The server encountered an error. Please try again later.';
  return 'Something went wrong.';
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: opts.method ?? 'GET',
      headers: opts.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      credentials: 'include',
      signal: opts.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ApiError(0, 'network_error', fallbackMessage(0));
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  // A static host returns HTML for unknown routes, which is not JSON.
  let data: { error?: { code?: string; message?: string; details?: { path: string; message: string }[] }; [k: string]: unknown } | null = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const err = data?.error ?? {};
    throw new ApiError(
      res.status,
      err.code ?? 'error',
      err.message ?? fallbackMessage(res.status),
      err.details,
    );
  }
  return data as T;
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
