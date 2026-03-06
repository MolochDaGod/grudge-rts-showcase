// ============================================
// Grudge Platform API Integration
// Connects to grudgeplatform.com for auth & data
// ============================================

const API_BASE = 'https://www.grudgeplatform.com';

/** Check if the Grudge Platform API is reachable */
export async function checkApiHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Initiate Discord OAuth login via Grudge Platform.
 * Redirects the browser to Discord's authorization page.
 */
export function startDiscordLogin() {
  const params = new URLSearchParams({
    client_id: '1082014817937461319',
    redirect_uri: `${window.location.origin}/`,
    response_type: 'code',
    scope: 'identify',
  });
  window.location.href = `https://discord.com/api/oauth2/authorize?${params}`;
}

/**
 * Exchange a Discord OAuth code for user data via the Grudge Platform API.
 * @param {string} code — OAuth authorization code
 * @returns {Promise<{id:string, username:string, avatar:string|null}|null>}
 */
export async function exchangeDiscordCode(code) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/discord`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Fetch user credits from Grudge Platform.
 * @param {string} userId
 * @returns {Promise<number|null>}
 */
export async function getUserCredits(userId) {
  try {
    const res = await fetch(`${API_BASE}/api/credits/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.credits ?? null;
  } catch {
    return null;
  }
}
