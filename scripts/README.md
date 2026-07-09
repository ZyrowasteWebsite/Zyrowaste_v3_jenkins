# Scripts

Utility scripts for the Swaroop Website project.

## Level 1 -- Getting Started (No Admin Rights)

| Script | Purpose |
|---|---|
| `bootstrap-node.ps1` | Downloads and extracts portable Node.js into `.tools/node/` (no admin installer) |
| `run-level1.ps1` | Starts beginner level app: local API + Vite frontend |
| `setup.mjs` | One-time setup helper (works with system Node or portable Node) |
| `dev-api.mjs` | Local API server that proxies chat to Groq (no backend needed) |

## Quick Start (Portable Node + Beginner Level)

```powershell
# 1) Download portable Node.js (no admin)
./scripts/bootstrap-node.ps1

# 2) First run creates frontend/.env
./scripts/run-level1.ps1

# 3) Edit frontend/.env and set GROQ_API_KEY
#    Get free key: https://console.groq.com/keys

# 4) Run again
./scripts/run-level1.ps1
```

Open `http://localhost:5173` and use the chatbot from bottom-right.

## Run from VS Code

1. Open this folder in VS Code.
2. Run task: `Bootstrap Portable Node (No Admin)` (first time only).
3. Run task: `Run Level 1 (Local Server)`.
4. Open `http://localhost:5173`.

You can also press `F5` and choose `Level 1: Launch in Edge`.

## If You Already Have Node Installed

```bash
node scripts/setup.mjs
node scripts/dev-api.mjs
cd frontend
npm run dev
```
