import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function cosmoApiDevPlugin(): Plugin {
  return {
    name: 'cosmo-api-dev-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/api/cosmo') && req.method === 'POST') {
          const env = loadEnv(server.config.mode, process.cwd(), '');
          const apiKey = env.GROQ_API_KEY || process.env.GROQ_API_KEY || '';

          if (!apiKey) {
            res.statusCode = 503;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'GROQ_API_KEY not configured on server' }));
            return;
          }

          let rawBody = '';
          req.on('data', (chunk) => {
            rawBody += chunk;
          });

          req.on('end', async () => {
            try {
              const { messages = [], systemPrompt = '' } = JSON.parse(rawBody || '{}');
              const endpoint = env.GROQ_ENDPOINT || 'https://api.groq.com/openai/v1/chat/completions';
              const model = env.GROQ_MODEL || 'openai/gpt-oss-120b';

              const groqRes = await fetch(endpoint, {
                method: 'POST',
                headers: {
                  'content-type': 'application/json',
                  authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                  model,
                  max_tokens: 260,
                  temperature: 0.5,
                  messages: [
                    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
                    ...messages.slice(-8),
                  ],
                }),
              });

              if (!groqRes.ok) {
                const errText = await groqRes.text();
                res.statusCode = groqRes.status;
                res.setHeader('Content-Type', 'application/json');
                res.end(errText);
                return;
              }

              const data = await groqRes.json();
              const reply = data?.choices?.[0]?.message?.content?.trim() || '';

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ reply }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err?.message || 'Proxy error' }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), cosmoApiDevPlugin()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
