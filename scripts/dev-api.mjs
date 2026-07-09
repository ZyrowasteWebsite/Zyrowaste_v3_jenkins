/**
 * Level 1 -- Lightweight local API server.
 * Proxies /api/chat requests to Groq so the Vite dev server
 * can reach a real LLM without Vercel or the full FastAPI backend.
 *
 * Usage:
 *   1. Copy frontend/.env.example to frontend/.env and set GROQ_API_KEY
 *   2. node scripts/dev-api.mjs          (reads .env from frontend/)
 *   3. In another terminal: cd frontend && npm run dev
 */

import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function loadEnv() {
  const paths = [
    resolve(ROOT, "frontend", ".env"),
    resolve(ROOT, "frontend", ".env.local"),
    resolve(ROOT, ".env"),
  ];
  for (const p of paths) {
    if (existsSync(p)) {
      const lines = readFileSync(p, "utf-8").split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) process.env[key] = val;
      }
      console.log(`  Loaded env from ${p}`);
    }
  }
}

loadEnv();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const PORT = parseInt(process.env.API_PORT || "8000", 10);

if (!GROQ_API_KEY || GROQ_API_KEY === "gsk_your_key_here") {
  console.error(
    "\n  ERROR: GROQ_API_KEY is not set.\n" +
    "  Copy frontend/.env.example to frontend/.env and add your key.\n" +
    "  Get a free key at https://console.groq.com/keys\n"
  );
  process.exit(1);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString()));
    req.on("error", reject);
  });
}

const server = createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/api/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "healthy", level: 1 }));
    return;
  }

  if (req.method === "POST" && req.url === "/api/chat") {
    try {
      const body = JSON.parse(await readBody(req));

      const groqRes = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: body.messages,
            temperature: 0.7,
            max_tokens: 1024,
          }),
        }
      );

      if (!groqRes.ok) {
        const errText = await groqRes.text();
        console.error(`  Groq API error ${groqRes.status}: ${errText}`);
        res.writeHead(groqRes.status, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Groq API error", details: errText }));
        return;
      }

      const data = await groqRes.json();
      const reply =
        data.choices?.[0]?.message?.content ?? "No response from model.";

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ reply }));
    } catch (err) {
      console.error("  Request error:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: String(err) }));
    }
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`\n  Swaroop Dev API (Level 1)`);
  console.log(`  Listening on http://localhost:${PORT}`);
  console.log(`  Proxying chat to Groq (llama-3.3-70b-versatile)\n`);
});
