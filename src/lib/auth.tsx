import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { config } from "./config";
import type { AuthSession, AuthResponse, User, Account } from "@/shared/schema";

// ─── Types ───────────────────────────────────────────────────

interface AuthContextValue {
  /** Current session (null when logged out) */
  session: AuthSession | null;
  /** Full user profile (fetched after login) */
  user: User | null;
  /** User's game account */
  account: Account | null;
  /** True while checking localStorage / validating token on mount */
  isLoading: boolean;
  /** Convenience: session !== null */
  isAuthenticated: boolean;

  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email?: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  loginWithDiscord: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Helpers ─────────────────────────────────────────────────

const { STORAGE_KEYS } = config;

function persistSession(session: AuthSession) {
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, session.token);
  localStorage.setItem(STORAGE_KEYS.USER_ID, session.userId);
  localStorage.setItem(STORAGE_KEYS.USERNAME, session.username);
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_ID);
  localStorage.removeItem(STORAGE_KEYS.USERNAME);
}

function readStoredSession(): AuthSession | null {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
  const username = localStorage.getItem(STORAGE_KEYS.USERNAME);

  if (!token || !userId || !username) return null;

  return {
    token,
    userId,
    username,
    displayName: username,
    isPremium: false,
    isGuest: username.startsWith("guest_"),
    expiresAt: Date.now() + config.TOKEN_TTL_MS, // approximate; real expiry is server-side
  };
}

/** Parse OAuth callback params that the auth-gateway appends to the return URL */
function parseOAuthCallback(): AuthSession | null {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const userId = params.get("userId");
  const username = params.get("username");

  if (!token || !userId || !username) return null;

  // Clean up the URL so the params don't linger
  const url = new URL(window.location.href);
  url.searchParams.delete("token");
  url.searchParams.delete("userId");
  url.searchParams.delete("username");
  url.searchParams.delete("isNew");
  window.history.replaceState({}, "", url.pathname + url.hash);

  return {
    token,
    userId,
    username,
    displayName: username,
    isPremium: false,
    isGuest: false,
    expiresAt: Date.now() + config.TOKEN_TTL_MS,
  };
}

async function authGatewayPost(
  endpoint: string,
  body: Record<string, unknown>,
): Promise<AuthResponse> {
  const res = await fetch(`${config.AUTH_GATEWAY_URL}/api/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(text);
  }

  return res.json();
}

function responseToSession(r: AuthResponse): AuthSession {
  return {
    token: r.token,
    userId: r.userId,
    username: r.username,
    displayName: r.displayName,
    isPremium: r.isPremium,
    isGuest: r.isGuest ?? false,
    expiresAt: r.expiresAt,
  };
}

// ─── Provider ────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate session from OAuth callback or localStorage on mount
  useEffect(() => {
    const oauthSession = parseOAuthCallback();
    const stored = oauthSession ?? readStoredSession();

    if (stored) {
      persistSession(stored);
      setSession(stored);
    }

    setIsLoading(false);
  }, []);

  const handleAuthSuccess = useCallback((res: AuthResponse) => {
    const s = responseToSession(res);
    persistSession(s);
    setSession(s);
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const res = await authGatewayPost("login", { username, password });
      handleAuthSuccess(res);
    },
    [handleAuthSuccess],
  );

  const register = useCallback(
    async (username: string, password: string, email?: string) => {
      const res = await authGatewayPost("register", { username, password, email });
      handleAuthSuccess(res);
    },
    [handleAuthSuccess],
  );

  const loginAsGuest = useCallback(async () => {
    let deviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
    }
    const res = await authGatewayPost("guest", { deviceId });
    handleAuthSuccess(res);
  }, [handleAuthSuccess]);

  const loginWithDiscord = useCallback(() => {
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.href = `${config.AUTH_GATEWAY_URL}/?return=${returnUrl}`;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
    setUser(null);
    setAccount(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        account,
        isLoading,
        isAuthenticated: session !== null,
        login,
        register,
        loginAsGuest,
        loginWithDiscord,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
