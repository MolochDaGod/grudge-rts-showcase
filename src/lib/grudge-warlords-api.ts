/**
 * Grudge Warlords API Client
 * Cross-origin calls to https://grudgewarlords.com/api/public/*
 * Used by the Grudge Studio site to display player data and platform stats.
 */

const WARLORDS_API = "https://grudgewarlords.com";

export interface PlayerSummary {
  found: boolean;
  grudgeId?: string;
  username?: string;
  authType?: string;
  premium?: boolean;
  gold?: number;
  resources?: number;
  hasWallet?: boolean;
  createdAt?: string;
  lastLogin?: string;
  characters?: {
    name: string;
    raceId: string;
    classId: string;
    level: number;
    experience: number;
    isActive: boolean;
  }[];
  characterCount?: number;
  highestLevel?: number;
  arenaTeams?: {
    teamId: string;
    status: string;
    wins: number;
    losses: number;
    totalBattles: number;
    heroCount: number;
    avgLevel: number;
  }[];
  totalArenaWins?: number;
  totalArenaLosses?: number;
  island?: string | null;
}

export interface PlatformStats {
  totalPlayers: number;
  totalHeroes: number;
  arenaTeams: number;
  arenaBattles: number;
  serverTime: number;
}

export interface ServiceStatus {
  platform: string;
  version: string;
  timestamp: number;
  services: {
    database: { available: boolean };
    objectStore: { available: boolean; datasets: number; cached: number };
    ai: { agents: number; serverSide: boolean };
    puter: { available: boolean };
  };
}

async function warlordsFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${WARLORDS_API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export const warlordsApi = {
  /** Get player summary by grudgeId (public, no auth required) */
  getPlayerSummary: (grudgeId: string) =>
    warlordsFetch<PlayerSummary>(`/api/public/player-summary/${grudgeId}`),

  /** Get global platform stats */
  getStats: () => warlordsFetch<PlatformStats>("/api/public/stats"),

  /** Get leaderboard */
  getLeaderboard: (limit = 20) =>
    warlordsFetch<{ leaderboard: { ownerName: string; rank: number; wins: number; losses: number; heroCount: number }[] }>(
      `/api/public/leaderboard?limit=${limit}`
    ),

  /** Get studio platform status (services health) */
  getServiceStatus: () =>
    warlordsFetch<ServiceStatus>("/api/studio/status"),

  /** Health check */
  isOnline: async (): Promise<boolean> => {
    try {
      const res = await fetch(`${WARLORDS_API}/api/health`, { method: "GET" });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Link a Grudge Studio Identity API session to a GrudgeWars account.
   * Sends the Identity API token + userId so GrudgeWars can associate
   * the two accounts via shared grudge_id.
   */
  linkSession: (authToken: string, userId: string) =>
    warlordsFetch<{ linked: boolean; grudgeId: string }>("/api/auth/link-studio", {
      method: "POST",
      body: JSON.stringify({ studioToken: authToken, studioUserId: userId }),
    }),
};
