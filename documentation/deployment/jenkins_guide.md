---
title: "Jenkins CI/CD & Production Deployment — Zyrowaste (zyrowaste.com)"
date: 2026-07-13
author: Swaroop Formulation Industries / Zyrowaste
level: 5
---

# Jenkins CI/CD & Production Deployment — Zyrowaste

This guide restores **zyrowaste.com** after moving from ad-hoc Docker to a **Jenkins-driven** production pipeline with rolling deploys, health gates, and automatic rollback.

## Architecture (production)

```
Internet → DNS (zyrowaste.com)
        → Droplet :80/:443 (nginx edge)
             ├─ /          → frontend (nginx + SPA)
             └─ /api/      → backend (FastAPI / uvicorn)
                  ├─ postgres
                  ├─ redis
                  └─ chromadb
```

Jenkins agent builds & pushes images, then SSHs to the droplet and runs a **rolling recreate** (backend → health → frontend → reload nginx). Failed smoke tests trigger **rollback** to the previous image tag.

| Artifact | Path |
|---|---|
| Pipeline | `Jenkinsfile` |
| Prod compose | `docker-compose.prod.yml` |
| Edge TLS nginx | `infrastructure/nginx/zyrowaste.conf` |
| HTTP bootstrap nginx | `infrastructure/nginx/zyrowaste.http-bootstrap.conf` |
| Deploy / health / rollback | `scripts/jenkins/*.sh` |
| Env template | `.env.production.example` |

---

## Prerequisites

1. **Droplet / VPS** with public IP (DigitalOcean recommended; 2 vCPU / 4 GB+).
2. **Domain** `zyrowaste.com` (and `www`) DNS A records → droplet IP **`143.244.128.22`**.
3. **Docker Hub or GHCR** account for image registry.
4. **Jenkins** (can be on the same droplet or a separate CI host) with plugins:
   - Docker Pipeline
   - SSH Agent
   - Credentials Binding
   - Pipeline / Git
   - Timestamper, AnsiColor (optional)
5. Git repo reachable by Jenkins (GitHub/GitLab).

---

## Part A — Bring the droplet back online (one-time)

### 1. Point DNS at the server

At your registrar / Cloudflare:

| Type | Name | Value |
|---|---|---|
| A | `@` | `143.244.128.22` |
| A | `www` | `143.244.128.22` |

Wait until `dig +short zyrowaste.com` returns `143.244.128.22`.

### 2. Bootstrap the server

```bash
ssh root@143.244.128.22
# copy scripts/jenkins/bootstrap-server.sh to the box, then:
bash bootstrap-server.sh
```

Or manually:

```bash
curl -fsSL https://get.docker.com | sh
mkdir -p /opt/zyrowaste/infrastructure/nginx/ssl /opt/zyrowaste/scripts/jenkins
```

### 3. Copy project deploy files

From your laptop (or after `git clone` on the server):

```bash
scp docker-compose.prod.yml root@143.244.128.22:/opt/zyrowaste/
scp infrastructure/nginx/zyrowaste.conf root@143.244.128.22:/opt/zyrowaste/infrastructure/nginx/
scp infrastructure/nginx/zyrowaste.http-bootstrap.conf root@143.244.128.22:/opt/zyrowaste/infrastructure/nginx/
scp .env.production.example root@143.244.128.22:/opt/zyrowaste/.env.production
ssh root@143.244.128.22 "chmod 600 /opt/zyrowaste/.env.production && nano /opt/zyrowaste/.env.production"
```

Fill at least: `GROQ_API_KEY`, `JWT_SECRET`, `POSTGRES_PASSWORD`, matching `DATABASE_URL`, and image names (`FRONTEND_IMAGE` / `BACKEND_IMAGE`).

### 4. First TLS certificate

**Option A — standalone Certbot (site down briefly on :80):**

```bash
docker run --rm -p 80:80 \
  -v /opt/zyrowaste/infrastructure/nginx/ssl:/etc/letsencrypt \
  certbot/certbot certonly --standalone \
  -d zyrowaste.com -d www.zyrowaste.com \
  --email admin@zyrowaste.com --agree-tos --non-interactive
```

**Option B — HTTP bootstrap first:**

```bash
cd /opt/zyrowaste
cp infrastructure/nginx/zyrowaste.http-bootstrap.conf infrastructure/nginx/zyrowaste.conf
# Build/pull images once (see below), then:
docker compose -f docker-compose.prod.yml up -d
# Then obtain cert via webroot and restore HTTPS zyrowaste.conf
```

Certs must exist at:

`/opt/zyrowaste/infrastructure/nginx/ssl/live/zyrowaste.com/fullchain.pem`  
`/opt/zyrowaste/infrastructure/nginx/ssl/live/zyrowaste.com/privkey.pem`

### 5. Manual first deploy (before Jenkins)

Build images on the droplet **or** pull from registry:

```bash
cd /opt/zyrowaste   # or your git checkout
# Local build path:
docker build -t ghcr.io/zyrowaste/frontend:latest ./frontend
docker build -t ghcr.io/zyrowaste/backend:latest ./backend
# Align IMAGE_* in .env.production, then:
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
curl -k https://zyrowaste.com/api/health
curl -k https://zyrowaste.com/
```

Site should respond. Then wire Jenkins for ongoing deploys.

---

## Part B — Jenkins setup (end-to-end)

### 1. Install Jenkins (example: Ubuntu)

```bash
sudo apt update
sudo apt install -y openjdk-17-jre
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update && sudo apt install -y jenkins
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

Open `http://<jenkins-host>:8080`, unlock with the initial admin password, install suggested plugins + **Docker Pipeline** + **SSH Agent**.

### 2. Credentials (Manage Jenkins → Credentials)

| ID | Type | Purpose |
|---|---|---|
| `docker-registry` | Username/password | GHCR or Docker Hub push/pull |
| `ssh-prod` | SSH Username with private key | Deploy to droplet (`root` or deploy user) |

### 3. Global / job environment (optional)

In the Pipeline job or Jenkins global env:

| Variable | Example |
|---|---|
| `DOCKER_REGISTRY` | `ghcr.io` |
| `IMAGE_NAMESPACE` | `zyrowaste` (or `your-github-org`) |
| `PROD_HOST` | `143.244.128.22` (already default in `Jenkinsfile`) |

SSH uses the **public IP** (`143.244.128.22`). Smoke tests still use the domain (`https://zyrowaste.com`). See `scripts/jenkins/droplet.env.example`.

### 4. Create the Pipeline job

1. **New Item** → **Pipeline** → name `zyrowaste-production`.
2. **Pipeline** → Definition: **Pipeline script from SCM**.
3. SCM: Git → your repo URL → credentials if private.
4. Branch: `*/main` (or `master`).
5. Script Path: `Jenkinsfile`.
6. Save.

### 5. SSH access from Jenkins → droplet

```bash
# On Jenkins host as jenkins user
sudo -u jenkins ssh-keygen -t ed25519 -f /var/lib/jenkins/.ssh/id_ed25519 -N ""
sudo -u jenkins cat /var/lib/jenkins/.ssh/id_ed25519.pub
# Add that pubkey to droplet: /root/.ssh/authorized_keys
# Paste private key into Jenkins credential `ssh-prod`
```

Test:

```bash
sudo -u jenkins ssh -i /var/lib/jenkins/.ssh/id_ed25519 root@143.244.128.22 'docker ps'
```

### 6. Registry login on the droplet

```bash
ssh root@143.244.128.22
echo '<PAT>' | docker login ghcr.io -u <github-user> --password-stdin
```

Image names in `.env.production` must match what Jenkins pushes (`FRONTEND_IMAGE` / `BACKEND_IMAGE`).

### 7. Run the pipeline

1. Open job → **Build with Parameters**.
2. `DEPLOY_ENV=production`, leave `SKIP_TESTS=false`, `FORCE_DEPLOY` only if needed.
3. **Build**.

Expected stages:

`Checkout → Validate → Lint → Test → Build images → Security scan → Push → Deploy → Smoke`

On success: `https://zyrowaste.com` and `https://zyrowaste.com/api/health` return healthy.

### 8. Rollback

Automatic on pipeline failure after deploy. Manual:

```bash
# From Jenkins "Build with Parameters"
IMAGE_TAG_OVERRIDE=<previous_build_number>
FORCE_DEPLOY=true
```

Or on server:

```bash
cd /opt/zyrowaste
# scripts/jenkins/rollback.sh from a machine with ssh-agent, or:
export IMAGE_TAG=$(cat .previous_tag)
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --force-recreate frontend backend
```

---

## Part C — Zero-downtime behaviour

What this stack does on each deploy:

1. Pull new frontend/backend tags.
2. Recreate **backend** first; wait until Docker healthcheck passes (`/api/health`).
3. Recreate **frontend**; wait until healthy.
4. Reload **nginx** (edge keeps listening on 80/443).
5. Jenkins smoke-tests public HTTPS endpoints.
6. On failure → restore `.previous_tag`.

Postgres / Redis / Chroma volumes are **not** recreated, so data persists.

True multi-replica blue/green needs Swarm/K8s; on a single droplet this rolling recreate + health gate is the practical production pattern.

---

## Part D — Checklist to get zyrowaste.com back up

- [ ] DNS A records for `@` and `www` → `143.244.128.22`  
- [ ] Docker installed on droplet  
- [ ] `/opt/zyrowaste/.env.production` filled (no secrets in git)  
- [ ] TLS certs under `infrastructure/nginx/ssl/live/zyrowaste.com/`  
- [ ] Images built or pulled; `docker compose -f docker-compose.prod.yml up -d`  
- [ ] `curl https://zyrowaste.com/api/health` → `healthy`  
- [ ] Jenkins credentials + Pipeline from `Jenkinsfile`  
- [ ] Green pipeline run  

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| 502 from nginx | Backend not healthy — `docker compose logs backend` |
| SSL error / nginx won't start | Certs missing — use HTTP bootstrap or issue Certbot certs |
| CORS errors | Set `CORS_ORIGINS=https://zyrowaste.com,https://www.zyrowaste.com` |
| Jenkins can't SSH | Firewall / authorized_keys / wrong `PROD_HOST` |
| Pull denied | `docker login` on droplet; check image names |
| Site still down after compose up | Confirm ports 80/443 open (`ufw`); DNS TTL |

---

## Security notes

- Keep `.env.production` chmod `600` on the server only.
- Do not publish Postgres/Redis ports publicly (prod compose keeps them internal).
- Prefer short-lived registry PATs; rotate `JWT_SECRET` if it was ever committed.
- Restrict Jenkins UI (VPN / reverse proxy + auth).
