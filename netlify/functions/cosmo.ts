/**
 * netlify/functions/cosmo.ts — Netlify Serverless Function for COSMO chat proxy.
 *
 * Keeps GROQ_API_KEY secure on the server side — never exposed in client bundles.
 * Compatible with Netlify Functions v2 (Request/Response) and v1 (HandlerEvent).
 */

interface RequestBody {
  messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  systemPrompt?: string;
}

export default async function handler(req: Request | any, context?: any) {
  // Determine HTTP Method
  const method = req?.method || req?.httpMethod || 'POST';
  if (method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.GROQ_API_KEY || process.env.COSMO_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'GROQ_API_KEY is not configured in Netlify environment variables.' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const endpoint = process.env.GROQ_ENDPOINT || 'https://api.groq.com/openai/v1/chat/completions';
  const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

  let body: RequestBody = {};
  try {
    if (typeof req.json === 'function') {
      body = await req.json();
    } else if (req.body) {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }
  } catch {
    body = {};
  }

  const { messages = [], systemPrompt = '' } = body;

  try {
    const payload = {
      model,
      max_tokens: 260,
      temperature: 0.5,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        ...messages.slice(-8),
      ],
    };

    const groqRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return new Response(errText, {
        status: groqRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await groqRes.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || '';

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || 'Failed to communicate with LLM' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
