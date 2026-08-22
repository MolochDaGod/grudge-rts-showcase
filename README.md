# Grudge RTS Showcase

**3D game showcase and demo collection featuring multiple playable Three.js experiences.**

Live demo showcasing Grudge Studio's game development capabilities with interactive 3D environments, physics simulations, and real-time gameplay.

## Overview

This is a React-based 3D game showcase featuring:
- **Multiple playable demos** using Three.js and Cannon.js physics
- **Interactive 3D environments** — MOBA-style arena combat, racing games, and more
- **Real-time gameplay** with weapon systems, character controls, and AI
- **Grudge Studio integration** — authentication, asset management, and platform connectivity

## Quick Start

```bash
npm install
cp .env.example .env   # configure environment variables
npm run dev            # Vite dev server on :5173
```

Deploys automatically to Vercel on push to `main`.

## Stack

- **React 18** + TypeScript + Vite
- **Three.js** — 3D rendering and scene management
- **Cannon-es** — physics simulation for racing game
- **wouter** — client-side routing
- **TanStack Query** — data fetching and caching
- **shadcn/ui** — Radix + Tailwind component library
- **Tailwind CSS** — styling with custom Grudge theme tokens

## Featured Demos

### 🌋 Avernus Arena
**3D MOBA-style PvP combat** — Choose dual weapons (Greatsword, Bow, Sabres, Scythe, Runeblade), each with unique subclass abilities and resource systems. Real-time arena combat with minions, towers, and strategic gameplay.

**Route:** `/avernus-3d`  
**Tech:** Three.js, OrbitControls, procedural weapon models

### 🏎️ Overdrive 3D
**Realistic racing with physics** — Full vehicle simulation using Cannon.js raycasting. Dodge obstacles (barrels, crates, rocks), maintain speed, and survive as long as possible.

**Route:** `/overdrive-3d`  
**Tech:** Three.js, Cannon-es RaycastVehicle, dynamic camera tracking

### 🏰 Other Demos
- **Wargus** (`/wargus`) — RTS-style game demo
- **Tower Defense** (`/tower-defense`) — 3D tower defense mechanics
- **Decay Survival** (`/decay-survival`) — survival game prototype
- **GGE Scene** (`/gge-scene`) — Grudge Game Engine showcase
- **Puzzle Platformer** (`/puzzle-platformer`) — 3D platforming mechanics

## Project Structure

```
src/
  lib/
    config.ts                 # Environment config (identity API, asset CDN, storage keys)
    auth.tsx                  # AuthProvider + useAuth() — Discord OAuth, user/pass, guest
    api.ts                    # API clients (auth, scraping, store)
    grudge-warlords-api.ts    # Cross-origin client for grudgewarlords.com
  pages/
    home.tsx                  # Landing page with project showcase
    avernus-3d.tsx            # 3D MOBA arena combat game
    overdrive-3d.tsx          # 3D racing game with physics
    wargus.tsx                # RTS game demo
    tower-defense.tsx         # Tower defense demo
    [other demos...]
  components/
    header.tsx / footer.tsx   # Global nav with auth state
    protected-route.tsx       # Auth-gated route wrapper
    hero.tsx / features.tsx   # Landing page sections
```

## Authentication

Authentication is handled by the **Grudge Identity API** at `https://id.grudge-studio.com`:

- **Discord OAuth** (redirects through identity API)
- **Username/password** (register + login)
- **Guest mode** (device-id based)

Session stored in `localStorage` under `grudge_auth_token`, `grudge_user_id`, `grudge_username`.

The `useAuth()` hook provides `session`, `isAuthenticated`, `login()`, `register()`, `loginAsGuest()`, `loginWithDiscord()`, `logout()`.

## Grudge Ecosystem URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Identity API** | `https://id.grudge-studio.com` | Authentication, OAuth, user management |
| **Asset CDN** | `https://assets.grudge-studio.com` | Static game assets, images, models |
| **Objectstore** | `https://objectstore.grudge-studio.com` | Game asset catalog API (GET `/api/v1/catalog`) |
| **Grudge Warlords** | `https://grudgewarlords.com` | MMO game, provides public API |
| **Grudge Platform** | `https://www.grudgeplatform.com` | Investment & community hub |

## GBuX Token

**GBuX** is the Grudge Studio ecosystem token:
- **Network:** Solana
- **Type:** SPL Token
- **Mint Address:** `55TpSoMNxbfsNJ9U1dQoo9H3dRtDmjBZVMcKqvU2nray`
- **Decimals:** 6

Available in `config.GBUX_MINT` and `config.GBUX_DECIMALS`.

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_AUTH_GATEWAY_URL` | Identity API base URL | `https://id.grudge-studio.com` |
| `VITE_API_BASE_URL` | API endpoint base | `https://id.grudge-studio.com/api` |
| `VITE_APP_URL` | This app's public URL | `https://grudgestudio.com` |
| `VITE_DISCORD_REDIRECT_URI` | Discord OAuth redirect | `https://id.grudge-studio.com/api/discord` |

**Note:** Do not expose API keys or secrets via `VITE_` environment variables — they are bundled into the client.

## Protected Routes

These routes require authentication (redirect to `/` if not logged in):
- `/real-asset-browser`
- `/engine-launcher`
- `/asset-store`
- `/advanced-engines`
- `/collaboration-hub`
- `/analytics-dashboard`
- `/scraping`
- `/real-engine-manager`
- `/grudge-editor`

## Related Projects

- **Grudge Warlords** (`grudgewarlords.com`) — The MMO game, provides public API
- **Identity API** (`id.grudge-studio.com`) — Shared authentication service (Railway)
- **GDevelop Assistant** (`gdevelop-assistant.vercel.app`) — AI game dev tools, 3D editors
- **Objectstore Worker** (`objectstore.grudge-studio.com`) — Game asset catalog (v3.4.0)

## Development

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run preview    # Preview production build
npm run typecheck  # TypeScript validation
```

### Adding a New Demo

1. Create `src/pages/my-demo.tsx` with Three.js scene setup
2. Add route in `src/App.tsx` router
3. Import scene components and game logic
4. Use `useRef` for Three.js objects and game state
5. Clean up resources in `useEffect` return function

---

*May your grudges be eternal.*
