/**
 * api/cosmo.ts — Serverless / backend proxy endpoint for COSMO chat.
 *
 * Keeps GROQ_API_KEY safe on the server side — never exposed to client bundles.
 * Compatible with Vercel, Netlify Functions, and Node server environments.
 */

interface RequestBody {
  messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  systemPrompt?: string;
}

export default async function handler(req: any, res?: any) {
  // Handle HTTP method
  const method = req.method || (req instanceof Request ? req.method : 'POST');
  if (method !== 'POST') {
    if (res?.status) {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.GROQ_API_KEY || process.env.COSMO_API_KEY;
  if (!apiKey) {
    const errorMsg = { error: 'GROQ_API_KEY is not configured on the server.' };
    if (res?.status) return res.status(503).json(errorMsg);
    return new Response(JSON.stringify(errorMsg), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
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
      if (res?.status) return res.status(groqRes.status).send(errText);
      return new Response(errText, { status: groqRes.status });
    }

    const data = await groqRes.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || '';

    if (res?.status) {
      return res.status(200).json({ reply });
    }
    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    const errMsg = { error: err?.message || 'Failed to communicate with LLM' };
    if (res?.status) return res.status(500).json(errMsg);
    return new Response(JSON.stringify(errMsg), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
