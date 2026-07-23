// Zyrowaste — Production Jenkins Declarative Pipeline (1 GB DigitalOcean droplet)
//
// Space/memory optimisations for 1 GB instance:
//   • Backend tests run with requirements-dev.txt (no torch / sentence-transformers)
//   • Frontend build check reuses the npm-ci layer from the Lint stage (same node dir)
//   • Docker build cache pruned after push; workspace cleaned after every build
//   • Security scan is best-effort (won't fail the build)
//
// Jenkins credentials required:
//   docker-registry   — Username/password for GHCR (or Docker Hub)
//   ssh-prod          — SSH private key for root@143.244.128.22

pipeline {
  agent any

  options {
    timestamps()
    // Avoid queue-stuck when a previous run hangs: new run aborts older in-progress run.
    disableConcurrentBuilds(abortPrevious: true)
    buildDiscarder(logRotator(numToKeepStr: '10', artifactNumToKeepStr: '5'))
    timeout(time: 60, unit: 'MINUTES')
    ansiColor('xterm')
  }

  parameters {
    choice(
      name: 'DEPLOY_ENV',
      choices: ['production', 'staging'],
      description: 'Target environment'
    )
    booleanParam(
      name: 'SKIP_TESTS',
      defaultValue: true,
      description: 'Skip lint/unit tests (recommended on 1GB instance)'
    )
    booleanParam(
      name: 'FORCE_DEPLOY',
      defaultValue: false,
      description: 'Deploy even if current branch is not main/master'
    )
    string(
      name: 'IMAGE_TAG_OVERRIDE',
      defaultValue: '',
      description: 'Explicit image tag to deploy (rollback to a previous build)'
    )
    booleanParam(
      name: 'FRESH_CLEAN_DEPLOY',
      defaultValue: true,
      description: 'Before deploy, delete old containers/images/volumes on droplet'
    )
  }

  environment {
    PATH               = "/var/lib/jenkins/.local/bin:${env.PATH}"
    DOCKER_BUILDKIT    = "0"
    COMPOSE_DOCKER_CLI_BUILD = "0"
    APP_NAME           = 'zyrowaste'
    DOMAIN             = 'zyrowaste.com'
    REGISTRY           = "${env.DOCKER_REGISTRY ?: 'ghcr.io'}"
    IMAGE_NAMESPACE    = "${env.IMAGE_NAMESPACE ?: 'zyrowaste'}"
    FRONTEND_IMAGE     = "${REGISTRY}/${IMAGE_NAMESPACE}/frontend"
    BACKEND_IMAGE      = "${REGISTRY}/${IMAGE_NAMESPACE}/backend"
    // Use build number unless a manual override is provided
    IMAGE_TAG          = "${params.IMAGE_TAG_OVERRIDE?.trim() ? params.IMAGE_TAG_OVERRIDE.trim() : env.BUILD_NUMBER}"
    COMPOSE_PROJECT    = 'zyrowaste'
    DEPLOY_PATH        = '/opt/zyrowaste'
    PROD_HOST          = "${env.PROD_HOST ?: '143.244.128.22'}"
    HEALTH_URL         = "https://${DOMAIN}/api/health"
    SITE_URL           = "https://${DOMAIN}/"
  }

  stages {
    stage('Pre-clean Jenkins node disk') {
      steps {
        sh '''
          set +e
          df -h || true
          # Do not kill unrelated running containers on the Jenkins node.
          docker ps -aq --filter "name=zyrowaste" | xargs -r docker rm -f || true
          docker container prune -f || true
          docker image prune -a -f || true
          docker volume prune -f || true
          docker builder prune -a -f || true
          df -h || true
        '''
      }
    }


    // ── 1. Checkout ──────────────────────────────────────────────────────────
    stage('Checkout') {
      steps {
        checkout scm
        script {
          env.GIT_COMMIT_SHORT = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
          env.GIT_BRANCH_NAME  = sh(script: 'git rev-parse --abbrev-ref HEAD', returnStdout: true).trim()
          echo "Commit=${env.GIT_COMMIT_SHORT}  Branch=${env.GIT_BRANCH_NAME}  Tag=${env.IMAGE_TAG}"
        }
      }
    }

    // ── 2. Lint ───────────────────────────────────────────────────────────────
    stage('Lint') {
      when { expression { !params.SKIP_TESTS } }
      parallel {
        stage('Frontend lint') {
          steps {
            dir('frontend') {
              sh '''
                #!/bin/bash
                set -eu
                npm ci --prefer-offline 2>&1 | tail -5
                npm run lint
              '''
            }
          }
        }
        stage('Backend lint') {
    when {
        expression { !params.SKIP_TESTS }
    }
    steps {
        sh '''
            set -eu

            # Create temporary virtual environment
            python3 -m venv .lint-venv

            # Activate it
            . .lint-venv/bin/activate

            # Upgrade pip
            python -m pip install --quiet --upgrade pip

            # Install Ruff inside the venv
            pip install --quiet ruff
  
            # Run lint
            ruff check backend/

            # Cleanup
            deactivate
            rm -rf .lint-venv
        '''
    }
}
      }
    }

    // ── 3. Test ───────────────────────────────────────────────────────────────
    // Backend tests use requirements-dev.txt (no torch) — runs on the Jenkins host.
    // Only test_models.py (pure Pydantic, no external services) is collected to
    // keep CI fast and avoid needing GROQ_API_KEY / Chroma at test time.
    stage('Test') {
      when { expression { !params.SKIP_TESTS } }
      parallel {
        stage('Frontend build check') {
          steps {
            dir('frontend') {
              sh '''
                #!/bin/bash
                set -eu
                # node_modules already present from Lint stage — skip re-install
                [ -d node_modules ] || npm ci --prefer-offline
                npm run build
                rm -rf dist
              '''
            }
          }
        }
        stage('Backend unit tests') {
          steps {
            sh '''
              
              set -eu

              # Create a fresh venv scoped to this build to avoid polluting the agent
              VENV_DIR="${WORKSPACE}/.test-venv"
              python3 -m venv "${VENV_DIR}"
              # shellcheck disable=SC1090
              . "${VENV_DIR}/bin/activate"

              # Install slim dev deps (no torch / sentence-transformers)
              "${VENV_DIR}/bin/pip" install --quiet --upgrade pip
              "${VENV_DIR}/bin/pip" install --quiet -r backend/requirements-dev.txt

              # Run only pure-unit tests that need no live services
              GROQ_API_KEY=ci-placeholder \
              PYTHONPATH=backend \
              "${VENV_DIR}/bin/pytest" backend/tests/test_models.py --tb=short -q

              
              rm -rf "${VENV_DIR}"
            '''
          }
        }
      }
    }

    // ── 4. Build Docker images ────────────────────────────────────────────────
    stage('Build images') {
      steps {
        timeout(time: 40, unit: 'MINUTES') {
          script {
            docker.withRegistry("https://${env.REGISTRY}", 'docker-registry') {
              sh '''
                set -eu
                docker system df || true
                # Warm cache from last successful images (first run may miss, that's fine)
                docker pull "${FRONTEND_IMAGE}:latest" || true
                docker pull "${BACKEND_IMAGE}:latest" || true
              '''
              def frontendImg = docker.build(
                "${env.FRONTEND_IMAGE}:${env.IMAGE_TAG}",
                "--pull --cache-from ${env.FRONTEND_IMAGE}:latest -f frontend/Dockerfile ./frontend"
              )
              def backendImg = docker.build(
                "${env.BACKEND_IMAGE}:${env.IMAGE_TAG}",
                "--pull --cache-from ${env.BACKEND_IMAGE}:latest -f backend/Dockerfile ./backend"
              )
              frontendImg.tag('latest')
              backendImg.tag('latest')
            }
          }
        }
      }
    }

    // ── 5. Security scan (best-effort, never blocks deploy) ───────────────────
    stage('Security scan') {
      steps {
        sh '''
          set -eu
          if command -v trivy >/dev/null 2>&1; then
            trivy image --exit-code 0 --severity HIGH,CRITICAL --no-progress \
              "${FRONTEND_IMAGE}:${IMAGE_TAG}" || true
            trivy image --exit-code 0 --severity HIGH,CRITICAL --no-progress \
              "${BACKEND_IMAGE}:${IMAGE_TAG}" || true
          else
            echo "Trivy not installed on agent — skipping image scan"
          fi
        '''
      }
    }

    // ── 6. Push images ────────────────────────────────────────────────────────
    stage('Push images') {
      steps {
        script {
          docker.withRegistry("https://${env.REGISTRY}", 'docker-registry') {
            docker.image("${env.FRONTEND_IMAGE}:${env.IMAGE_TAG}").push()
            docker.image("${env.FRONTEND_IMAGE}:latest").push()
            docker.image("${env.BACKEND_IMAGE}:${env.IMAGE_TAG}").push()
            docker.image("${env.BACKEND_IMAGE}:latest").push()
          }
        }
        // Free disk after push — dangling layers and the build-number tag can go
        sh '''
          docker image prune -f || true
          # Keep build cache so next build is incremental; prune only stale caches.
          docker builder prune -f --filter "until=168h" || true
        '''
      }
    }

    // ── 7. Deploy (rolling / zero-downtime) ──────────────────────────────────
    stage('Deploy') {
      when {
        anyOf {
          branch 'main'
          branch 'master'
          expression { params.FORCE_DEPLOY }
          expression { params.DEPLOY_ENV == 'production' }
        }
      }
      steps {
        sshagent(credentials: ['ssh-prod']) {
          sh """
            set -eu
            chmod +x deploy/scripts/jenkins/deploy.sh \
                     deploy/scripts/jenkins/healthcheck.sh \
                     deploy/scripts/jenkins/rollback.sh
            export FRONTEND_IMAGE='${FRONTEND_IMAGE}'
            export BACKEND_IMAGE='${BACKEND_IMAGE}'
            export IMAGE_TAG='${IMAGE_TAG}'
            export DEPLOY_PATH='${DEPLOY_PATH}'
            export PROD_HOST='${PROD_HOST}'
            export COMPOSE_PROJECT='${COMPOSE_PROJECT}'
            export DOMAIN='${DOMAIN}'
            export FRESH_CLEAN_DEPLOY='${params.FRESH_CLEAN_DEPLOY}'
            ./deploy/scripts/jenkins/deploy.sh
          """
        }
      }
    }

    // ── 8. Smoke / health ─────────────────────────────────────────────────────
    stage('Smoke / health') {
      steps {
        sh """
          set -eu
          chmod +x deploy/scripts/jenkins/healthcheck.sh
          ./deploy/scripts/jenkins/healthcheck.sh '${HEALTH_URL}' '${SITE_URL}' 30 10
        """
      }
    }
  }

  post {
    success {
      echo "✅ Zyrowaste build=${IMAGE_TAG} commit=${GIT_COMMIT_SHORT} live at https://${DOMAIN}"
    }
    failure {
      echo "❌ Pipeline failed — triggering rollback if deploy stage ran"
      script {
        try {
          sshagent(credentials: ['ssh-prod']) {
            sh """
              set +e
              export DEPLOY_PATH='${DEPLOY_PATH}'
              export PROD_HOST='${PROD_HOST}'
              export FRONTEND_IMAGE='${FRONTEND_IMAGE}'
              export BACKEND_IMAGE='${BACKEND_IMAGE}'
              export COMPOSE_PROJECT='${COMPOSE_PROJECT}'
              ./deploy/scripts/jenkins/rollback.sh || true
            """
          }
        } catch (err) {
          echo "Rollback script failed: ${err}"
        }
      }
    }
    always {
      // Always clean workspace to reclaim disk on the 1 GB droplet
      cleanWs(deleteDirs: true, notFailBuild: true)
    }
  }
}
