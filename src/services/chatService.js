// Chat service. Talks to the real backend chat endpoints
// (GET /api/chat/conversations, GET /api/chat/conversations/:id/messages,
// POST /api/chat/messages, POST /api/chat/conversations/:id/read), always with
// credentials:'include' so the session cookie is sent.
//
// Follows the authService.js / profileLookupService.js pattern: normalized
// { ok, ... } returns, defensive parsing, and a mock-fallback branch gated on
// config.USE_MOCK_FALLBACK (source: ../pages/app/Chat/chatData.js). Functions
// never throw to the caller — on a network error, !res.ok, or 401 they return
// an empty result (or the mock when fallback is enabled).
import { config } from '../config/index.js';
import { CONVERSATIONS } from '../pages/app/Chat/chatData.js';

// --- Load the conversation list -------------------------------------------
// The backend returns a BARE ARRAY, but we tolerate a wrapped object too
// ({ results } / { conversations }) so a future shape change does not break us.
export async function getConversations() {
  try {
    const res = await fetch(`${config.API_BASE}/chat/conversations`, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const conversations = Array.isArray(data) ? data : (data.results || data.conversations || []);
    return { ok: true, conversations };
  } catch (e) {
    console.error('getConversations failed', e);
    if (config.USE_MOCK_FALLBACK) return { ok: true, conversations: CONVERSATIONS };
    return { ok: false, conversations: [] };
  }
}

// --- Load one conversation's messages -------------------------------------
export async function getMessages(convId) {
  try {
    const res = await fetch(`${config.API_BASE}/chat/conversations/${convId}/messages`, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { ok: true, messages: data.messages || [] };
  } catch (e) {
    console.error('getMessages failed', e);
    if (config.USE_MOCK_FALLBACK) {
      const match = CONVERSATIONS.find((c) => c.id === convId);
      return { ok: true, messages: match ? match.messages : [] };
    }
    return { ok: false, messages: [] };
  }
}

// --- Send a message (keyed by the recipient's MAT id string) --------------
export async function sendMessage(matId, body) {
  try {
    const res = await fetch(`${config.API_BASE}/chat/messages`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ matId, body }),
    });
    if (res.status === 403) return { ok: false, status: 403, reason: 'messaging_blocked' };
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { ok: true, conversationId: data.conversationId, message: data.message };
  } catch (e) {
    console.error('sendMessage failed', e);
    if (config.USE_MOCK_FALLBACK) return { ok: true };
    return { ok: false };
  }
}

// --- Mark a conversation read ---------------------------------------------
export async function markRead(convId) {
  try {
    const res = await fetch(`${config.API_BASE}/chat/conversations/${convId}/read`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { ok: true, updated: data.updated };
  } catch (e) {
    console.error('markRead failed', e);
    if (config.USE_MOCK_FALLBACK) return { ok: true };
    return { ok: false };
  }
}
