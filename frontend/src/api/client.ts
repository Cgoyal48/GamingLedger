import { supabase } from "@/api/supabase";

class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Calls the Spring API with the current Supabase access token. Throws ApiError on non-2xx. */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    throw new ApiError(401, "Not signed in");
  }
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(path, { ...init, headers });
  if (!response.ok) {
    const problem = await response.json().catch(() => null);
    throw new ApiError(response.status, problem?.detail ?? problem?.title ?? response.statusText);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}

/** The server explains rejected requests (400) and conflicts (409); anything else gets the fallback. */
export function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError && (error.status === 400 || error.status === 409) ? error.message : fallback;
}

export function jsonBody(value: unknown): Pick<RequestInit, "body"> {
  return { body: JSON.stringify(value) };
}
