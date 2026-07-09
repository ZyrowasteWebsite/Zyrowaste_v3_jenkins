---
title: "Level 1 -- Foundation Chatbot (Beginner)"
date: 2026-03-25
level: 1
author: Swaroop Formulation Industries
---

# Level 1 -- Foundation Chatbot (Beginner)

## Goal

Deliver a **working chatbot** on a **static site**, deployed at no cost on **GitHub Pages** or **Vercel**.

## Tech Stack

| Area | Choice |
|------|--------|
| Frontend | **Vite** + **React** (TypeScript) |
| LLM | **Groq API** (free tier, Llama 3) |
| Hosting | **Vercel** free tier |

## Features

- Single-page site with **Swaroop** branding.
- **Embedded chatbot widget** (bottom-right).
- Chatbot answers questions about **biodegradable bags**, **PLA**, **certifications**, and **company** information.
- **System prompt** seeded with project report content for grounded tone and facts.

## Project Structure (Example)

```
src/
  components/
    Chatbot.tsx
  pages/
    index.tsx
  utils/
    llmClient.ts
  styles/
    (Tailwind / global CSS)
public/
api/                    # Vercel serverless (if used)
  chat.ts
```

Additional files typically include `vite.config.ts`, `package.json`, `tailwind.config.js`, and environment templates.

## Implementation Steps

1. **Initialize** a Vite + React + TypeScript project.
2. **Create** the landing page with company information and branding.
3. **Build** the chatbot component with local message state and UI scroll behavior.
4. **Integrate** the Groq API via a **serverless function** (proxy) so the API key stays server-side.
5. **Style** with **Tailwind CSS** for layout, widget position, and responsive behavior.
6. **Deploy** to Vercel (connect repository, set env vars, verify build).

## Deployment

### Vercel (recommended)

- **Free tier** includes generous **bandwidth** (on the order of **100 GB/month** for typical hobby use; confirm current limits in Vercel docs).
- **Serverless functions** for API routes that call Groq without exposing keys in the browser.

### GitHub Pages (alternative)

- Host static assets only; you still need a separate backend or serverless endpoint for the LLM unless using a client-only demo with a public proxy (not recommended for production keys).

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `GROQ_API_KEY` | Authenticate requests to Groq (set in Vercel project settings, never commit). |

## Version Control

- `git init` and a thorough **`.gitignore`** (node modules, `.env`, build output).
- Branches: **`main`** (stable) + **`dev`** (integration).
- Tag release: **`v0.1.0-l1-chatbot-basic`**.

## Hints

- Use **Vercel serverless functions** to **proxy** the Groq API and keep **`GROQ_API_KEY`** off the client.
- Keep the **system prompt** under roughly **4000 tokens** to leave room for user messages and the model context window.
