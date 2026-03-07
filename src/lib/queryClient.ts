import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { config } from "./config";

// ─── Helpers ─────────────────────────────────────────────────

function getAuthToken(): string | null {
  return localStorage.getItem(config.STORAGE_KEYS.AUTH_TOKEN);
}

/** Resolve a URL: if it starts with `/` prefix with API_BASE_URL */
function resolveUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // Strip leading `/api` if API_BASE_URL already ends with `/api`
  return `${config.API_BASE_URL}${url.startsWith("/api") ? url.slice(4) : url}`;
}

function buildHeaders(data?: unknown): Record<string, string> {
  const headers: Record<string, string> = {};
  if (data) headers["Content-Type"] = "application/json";
  const token = getAuthToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // On 401, clear stale auth and redirect to login
    if (res.status === 401) {
      localStorage.removeItem(config.STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(config.STORAGE_KEYS.USER_ID);
      localStorage.removeItem(config.STORAGE_KEYS.USERNAME);
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
        return;
      }
    }
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// ─── Core API Request ────────────────────────────────────────

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
): Promise<Response> {
  const res = await fetch(resolveUrl(url), {
    method,
    headers: buildHeaders(data),
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

// ─── React Query integration ─────────────────────────────────

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(resolveUrl(queryKey[0] as string), {
      headers: buildHeaders(),
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
