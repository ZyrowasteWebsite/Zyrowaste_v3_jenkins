# Zyrowaste Deploy

Jenkins CI/CD, Docker Compose, nginx, Terraform/K8s for **zyrowaste.com**.

Droplet: `143.244.128.22` (DigitalOcean 1 GB, Ubuntu)

## Contents

```
deploy/
├── Jenkinsfile*               → symlinked / referenced from root
├── docker-compose.yml         Local dev stack
├── docker-compose.prod.yml    Production stack (pulled images)
├── .env.production.example    Secrets template — copy to server only
├── scripts/jenkins/
│   ├── deploy.sh              SSH rolling deploy
│   ├── healthcheck.sh         Smoke tests
│   ├── rollback.sh            Revert to previous tag
│   └── bootstrap-server.sh   One-time server setup
├── infrastructure/
│   ├── nginx/                 Edge proxy (TLS + /api proxy)
│   ├── k8s/                   Kubernetes manifests (L6)
│   ├── terraform/             DigitalOcean IaC (L6)
│   ├── helm/                  Helm chart (L6)
│   └── monitoring/            Prometheus + Grafana (L6)
└── documentation/deployment/  Jenkins guide + deployment docs
```

## Bring zyrowaste.com online

1. **DNS**: A `@` + `www` → `143.244.128.22`
2. **Bootstrap**: `bash scripts/jenkins/bootstrap-server.sh` on the droplet
3. **Secrets**: copy `.env.production.example` → `/opt/zyrowaste/.env.production`, fill values
4. **TLS certs**: see `documentation/deployment/jenkins_guide.md`
5. **First deploy**: `docker compose -f docker-compose.prod.yml --env-file .env.production up -d`
6. **Jenkins**: point Pipeline SCM at this repo, `Jenkinsfile` at root

Full guide: `documentation/deployment/jenkins_guide.md`
