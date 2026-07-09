/**
 * One-time setup helper for Level 1.
 * Creates .env from .env.example if it doesn't exist, installs npm deps.
 * Works with system Node OR portable Node in .tools/node/**.
 *
 * Usage:
 *   node scripts/setup.mjs
 */

import { existsSync, copyFileSync, readdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const FE = resolve(ROOT, "frontend");

function findPortableNpmCmd() {
  const nodeRoot = resolve(ROOT, ".tools", "node");
  if (!existsSync(nodeRoot)) return null;

  const dirs = readdirSync(nodeRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith("node-v") && d.name.includes("win-x64"))
    .map((d) => d.name);

  for (const d of dirs) {
    const npmCmd = join(nodeRoot, d, "npm.cmd");
    if (existsSync(npmCmd)) return npmCmd;
  }
  return null;
}

console.log("\n  === Swaroop Website Setup (Level 1) ===\n");

const envFile = resolve(FE, ".env");
const envExample = resolve(FE, ".env.example");

if (!existsSync(envFile) && existsSync(envExample)) {
  copyFileSync(envExample, envFile);
  console.log("  Created frontend/.env from .env.example");
  console.log("  >> Edit frontend/.env and set your GROQ_API_KEY\n");
} else if (existsSync(envFile)) {
  console.log("  frontend/.env already exists\n");
}

const portableNpm = findPortableNpmCmd();
const npmCommand = portableNpm ? `\"${portableNpm}\" install` : "npm install";

console.log("  Installing frontend dependencies...\n");
try {
  execSync(npmCommand, { cwd: FE, stdio: "inherit" });
  console.log("\n  Dependencies installed.\n");
} catch {
  console.error("\n  npm install failed.");
  console.error("  If you do not have admin rights, run: scripts/bootstrap-node.ps1\n");
  process.exit(1);
}

console.log("  Setup complete! To start developing:\n");
if (portableNpm) {
  console.log("    PowerShell:  scripts/run-level1.ps1\n");
} else {
  console.log("    Terminal 1:  node scripts/dev-api.mjs");
  console.log("    Terminal 2:  cd frontend && npm run dev\n");
}
console.log("  Then open http://localhost:5173 in your browser.\n");
