// Grudge Studio — Centralized Environment Configuration
// All VITE_ prefixed vars are exposed to the client at build time.

export const config = {
  /** Auth gateway base URL (no trailing slash) */
  AUTH_GATEWAY_URL:
    import.meta.env.VITE_AUTH_GATEWAY_URL ||
    "https://grudge-builder-auth.vercel.app",

  /** API base URL — all apiRequest() calls are prefixed with this */
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://grudge-builder-auth.vercel.app/api",

  /** This app's public URL — used for OAuth return redirects */
  APP_URL:
    import.meta.env.VITE_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "https://grudgestudio.com"),

  /** Discord OAuth redirect (handled by auth-gateway) */
  DISCORD_REDIRECT_URI:
    import.meta.env.VITE_DISCORD_REDIRECT_URI ||
    "https://grudge-builder-auth.vercel.app/api/discord",

  // ─── Grudge Ecosystem URLs ───────────────────────────────

  /** Grudge Warlords — the MMO game */
  GRUDGE_WARLORDS_URL: "https://grudgewarlords.com",

  /** GDevelop Assistant — character editor, 3D model library, asset pipeline */
  GDEVELOP_ASSISTANT_URL: "https://gdevelop-assistant.vercel.app",

  /** GrudaChain — blockchain / on-chain systems */
  GRUDACHAIN_URL: "https://grudachain.grudgestudio.com",

  /** Grudge Platform — investment & community hub */
  GRUDGE_PLATFORM_URL: "https://www.grudgeplatform.com",

  /** GitHub organization */
  GITHUB_URL: "https://github.com/MolochDaGod",

  /** Discord community (update with real invite link) */
  DISCORD_URL: "https://discord.gg/grudgestudio",

  /** Steam game page */
  STEAM_URL: "https://store.steampowered.com/app/2707990/Grudge/",

  /** localStorage key names — match auth-gateway INTEGRATION.txt */
  STORAGE_KEYS: {
    AUTH_TOKEN: "grudge_auth_token",
    USER_ID: "grudge_user_id",
    USERNAME: "grudge_username",
    DEVICE_ID: "grudge_device_id",
  } as const,

  /** Token lifetime (7 days, matching auth-gateway) */
  TOKEN_TTL_MS: 7 * 24 * 60 * 60 * 1000,
} as const;

export type Config = typeof config;
