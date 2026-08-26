/**
 * cosmoApi.ts — the client-side bridge to COSMO's server proxy.
 *
 * All LLM requests are proxied through `/api/cosmo` to keep the Groq API key
 * strictly server-side. If the server proxy is unavailable or no API key is
 * configured on the backend, `askCosmo` seamlessly resolves from the offline
 * context brain — the UI never knows the difference.
 */

import { answerOffline, buildSystemPrompt, getOwnerMode, type CosmoView } from '../data/cosmo';
import { inspectCosmoRequest } from './cosmoFirewall';
import { getRelevantContext } from './cosmoKnowledge';

export type CosmoRole = 'user' | 'assistant';

const PROXY_ENDPOINT = import.meta.env.VITE_COSMO_ENDPOINT || '/api/cosmo';

/** True when COSMO is enabled (will attempt the server proxy with offline fallback). */
export const isCosmoOnline = (): boolean =>
  import.meta.env.VITE_COSMO_OFFLINE !== 'true';

/** Sends the conversation to the server-side LLM proxy, or answers offline.
    The firewall runs first — unsafe requests never leave the browser.
    `view` gives COSMO awareness of where the visitor is on the page. */
export async function askCosmo(
  history: Array<{ role: CosmoRole; content: string }>,
  view?: CosmoView
): Promise<string> {
  const last = history[history.length - 1]?.content ?? '';

  // Firewall — classify before anything else.
  const verdict = inspectCosmoRequest(last);
  if (!verdict.allowed) return verdict.reply!;

  if (!isCosmoOnline()) return answerOffline(last);

  const audience = await getOwnerMode();
  // Lightweight local retrieval: only the relevant knowledge snippets
  // (personal context file + resume + site facts) ride along — never the
  // full sources. Keeps Groq payloads small, fast and cheap. Retrieval
  // must never break the answer — on failure we just send less context.
  let relevant = '';
  try {
    relevant = getRelevantContext(last);
  } catch {
    relevant = '';
  }
  const systemPrompt = buildSystemPrompt(audience, view, relevant);
  const trimmed = history.slice(-8); // recent turns only — bounded payload

  try {
    const res = await fetch(PROXY_ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        messages: trimmed.map((m) => ({ role: m.role, content: m.content })),
        systemPrompt,
      }),
    });

    if (!res.ok) throw new Error(`proxy ${res.status}`);
    const data = await res.json();
    return data?.reply?.trim() || offlineFallback(last);
  } catch {
    // Never break the UI over a network failure — answer from context.
    return offlineFallback(last);
  }
}

function offlineFallback(question = 'help'): string {
  return answerOffline(question);
}
