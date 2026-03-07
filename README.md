# Grudge Studio — public-fawn-nine.vercel.app

**Marketing, tools hub, and account portal for the Grudge Studio ecosystem.**

Live at **https://public-fawn-nine.vercel.app** (migrating to `grudgestudio.com`)

## Quick Start

```bash
npm install
cp .env.example .env   # see Environment Variables below
npm run dev            # Vite dev server on :5173
```

Deploys automatically to Vercel on push to `main`.

## Stack

- **React 18** + TypeScript + Vite
- **wouter** for routing
- **TanStack Query** for data fetching
- **shadcn/ui** (Radix + Tailwind) component library
- **Tailwind CSS** with Grudge gold/dark theme tokens

## Project Structure

```
src/
  lib/
    auth.tsx                  # AuthProvider + useAuth() — Discord, username/password, guest
    config.ts                 # Centralized env config (AUTH_GATEWAY_URL, storage keys)
    api.ts                    # authApi, scrapingApi, storeApi clients
    grudge-warlords-api.ts    # Cross-origin client for grudgewarlords.com/api/public/*
  pages/
    home.tsx                  # Landing page
    advantage.tsx             # Grudge Studio Advantage — tools catalog + live player data
    login.tsx / register.tsx  # Auth flows
    engine-launcher.tsx       # Protected — engine launcher dashboard
    ...                       # Game pages, asset browser, store, etc.
  components/
    header.tsx / footer.tsx   # Global nav with auth state
    protected-route.tsx       # Redirects unauthenticated users
    white-label-solutions.tsx # Engine catalog with auth-gated launch
    ...
```

## Auth

Authentication is handled by the **auth-gateway** at `https://auth.grudgestudio.com`:

- Discord OAuth (redirects through auth-gateway)
- Username/password (register + login)
- Guest mode (device-id based)

Session is stored in `localStorage` under `grudge_auth_token`, `grudge_user_id`, `grudge_username`.

The `useAuth()` hook provides `session`, `isAuthenticated`, `login()`, `register()`, `loginAsGuest()`, `loginWithDiscord()`, `logout()`.

## Grudge Warlords Integration

The `grudge-warlords-api.ts` client fetches live data cross-origin from `https://grudgewarlords.com/api/public/*`:

- `warlordsApi.getPlayerSummary(grudgeId)` — heroes, arena record, gold, wallet status
- `warlordsApi.getStats()` — platform-wide player/hero/battle counts
- `warlordsApi.getLeaderboard()` — arena rankings
- `warlordsApi.isOnline()` — health check
- `warlordsApi.linkSession(token, userId)` — cross-origin session linking

This data is displayed on:
- **Advantage page** (`/advantage`) — player progress card, platform stats, server status banner
- **White-label solutions** component — auth-gated engine launch buttons

## Protected Routes

These routes require authentication (redirect to `/` if not logged in):
- `/real-asset-browser`
- `/engine-launcher`
- `/asset-store`
- `/advanced-engines`
- `/collaboration-hub`
- `/analytics-dashboard`

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_AUTH_GATEWAY_URL` | Auth gateway base URL (default: `https://auth.grudgestudio.com`) |
| `VITE_API_BASE_URL` | API base URL for auth-gateway calls |
| `VITE_APP_URL` | This app's public URL (for OAuth return) |
| `VITE_DISCORD_REDIRECT_URI` | Discord OAuth redirect (handled by auth-gateway) |

## Related Projects

- **Grudge Warlords** (`grudgewarlords.com`) — The MMO game, provides public API
- **Auth Gateway** (`auth.grudgestudio.com`) — Shared authentication service
- **PuterGrudge** — GrudgeOS dev environment

See the GrudgeWars repo's [GRUDGE_BEST_PRACTICES.md](https://github.com/MolochDaGod/StandaloneGrudge/blob/main/GRUDGE_BEST_PRACTICES.md) for cross-project conventions.

---

*May your grudges be eternal.*
