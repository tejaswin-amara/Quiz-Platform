# Deployment Guide — Quiz Platform Live

> **Architecture summary:** Static frontend on GitHub Pages + Spring Boot API on Railway + MySQL on Railway.
> The `glass-ui` Storybook deploys to `/storybook` on the same Pages site.

---

## Table of Contents

1. [Architecture overview](#1-architecture-overview)
2. [GitHub Pages — static frontend + Storybook](#2-github-pages)
3. [Railway — backend API + MySQL](#3-railway-backend)
4. [Local development setup](#4-local-development)
5. [Environment variables reference](#5-environment-variables)
6. [CI/CD pipeline reference](#6-cicd-pipeline)
7. [Rollback plan](#7-rollback)
8. [Verification checklist](#8-verification-checklist)

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│  Browser                                                      │
│                                                               │
│  https://<user>.github.io/Quiz-Platform/          (Pages)    │
│  https://<user>.github.io/Quiz-Platform/storybook (Pages)    │
│          │                                                    │
│          │  REST / JSON (CORS)                                │
│          ▼                                                    │
│  https://<service>.up.railway.app              (Railway)      │
│          │                                                    │
│          │  JDBC / TCP 3306                                   │
│          ▼                                                    │
│  MySQL 8.0 (Railway managed service)          (Railway)      │
└──────────────────────────────────────────────────────────────┘
```

**What runs where:**

| Component | Host | Branch | Deploy trigger |
|---|---|---|---|
| Static HTML/CSS/JS app | GitHub Pages | `copilot/build-java-quiz-platform` | Push to branch |
| glass-ui Storybook | GitHub Pages `/storybook` | same | Push to branch |
| Spring Boot API (Java 17) | Railway | same | Push to branch |
| MySQL 8.0 database | Railway (plugin) | — | Permanent |

---

## 2. GitHub Pages

### 2.1 First-time setup (do once)

1. Go to **Settings → Pages** in the repository.
2. Under **Source**, select **GitHub Actions** (not a branch).
3. Save. That's it — the workflow handles everything else.

> If you see "GitHub Actions" is not listed, ensure the repository is not private
> on a free plan that doesn't include Pages for private repos.

### 2.2 Repository variable for the API URL

The frontend reads its backend URL from a repository variable injected at build
time. Without this, all API calls go to the same origin (which fails on Pages).

1. Go to **Settings → Secrets and variables → Actions → Variables** tab.
2. Click **New repository variable**.
3. Name: `API_BASE_URL`
4. Value: your Railway backend URL, e.g. `https://quiz-platform-production-xxxx.up.railway.app`
5. Save.

The next push to the branch will bake this URL into `config.js` automatically.

### 2.3 Workflow

File: `.github/workflows/frontend-pages-deploy.yml`

Triggered on push to `copilot/build-java-quiz-platform` (or `main`) when:
- `src/main/resources/static/**` changes, **or**
- `glass-ui/**` changes

Steps:
1. `npm ci` + `npm run build-storybook` inside `glass-ui/`
2. Copies static app to `/tmp/pages-dist/`
3. Copies Storybook to `/tmp/pages-dist/storybook/`
4. Injects `config.js` with `API_BASE_URL`
5. Uploads and deploys via `actions/deploy-pages`

### 2.4 Expected URLs after first deploy

| URL | Content |
|---|---|
| `https://<user>.github.io/Quiz-Platform/` | Live quiz app |
| `https://<user>.github.io/Quiz-Platform/storybook/` | glass-ui component library |

---

## 3. Railway Backend

### 3.1 Create the project

```bash
# Install Railway CLI (optional but useful)
npm install -g @railway/cli
railway login
```

Or use the Railway web dashboard at https://railway.app

### 3.2 Add MySQL plugin

1. In your Railway project, click **+ New** → **Database** → **MySQL**.
2. Railway creates a managed MySQL 8.0 instance and sets:
   - `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`
3. In your **app service** Variables, set:
   ```
   DB_URL=jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}
   DB_USERNAME=${{MySQL.MYSQLUSER}}
   DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
   ```
   Railway resolves the `${{...}}` references automatically.

### 3.3 Deploy from GitHub

1. In the Railway project, click **+ New** → **GitHub Repo**.
2. Authorize Railway and select `tejaswin-amara/Quiz-Platform`.
3. Set the **Root Directory** to `/` (repo root).
4. Railway detects `railway.toml` and uses `Dockerfile.railway`.

### 3.4 Set all environment variables

In **Variables** tab of the app service, set every variable from §5.
The minimum set to get the app running:

```
SPRING_PROFILES_ACTIVE   = prod
SERVER_PORT              = 8080
DB_URL                   = (from MySQL plugin, see §3.2)
DB_USERNAME              = (from MySQL plugin)
DB_PASSWORD              = (from MySQL plugin)
JWT_SECRET_BASE64        = (generate below)
APP_ALLOWED_ORIGINS      = https://<user>.github.io
```

**Generate a JWT secret:**
```bash
openssl rand -base64 48
# Example output: abc123...  (copy the whole string)
```

### 3.5 Set deploy branch

In Railway → Service Settings → Source, confirm the branch is
`copilot/build-java-quiz-platform`.

### 3.6 Verify deployment

```bash
# Health check
curl https://<service>.up.railway.app/actuator/health
# Expected: {"status":"UP"}

# CORS preflight (replace origin with your actual Pages URL)
curl -I -X OPTIONS \
  -H "Origin: https://<user>.github.io" \
  -H "Access-Control-Request-Method: POST" \
  https://<service>.up.railway.app/auth/login
# Expected: 200 with Access-Control-Allow-Origin header
```

### 3.7 Flyway migrations

Flyway runs automatically on startup (`spring.flyway.enabled=true`).
On first boot against a fresh MySQL database, it will:
1. Create the `flyway_schema_history` table
2. Apply `V1__baseline.sql` (schema)
3. Apply `V2__players_unique_session_name.sql` (constraint)

No manual steps needed.

---

## 4. Local Development

### 4.1 Prerequisites

| Tool | Version |
|---|---|
| JDK | 17+ (Eclipse Temurin recommended) |
| Maven | 3.9+ |
| Node.js | 18, 20, or 22 |
| Docker Desktop | 24+ (for Docker Compose) |

### 4.2 Backend (H2, no external DB)

```bash
# Clone and run with embedded H2 (default profile)
git clone https://github.com/tejaswin-amara/Quiz-Platform.git
cd Quiz-Platform
git checkout copilot/build-java-quiz-platform

mvn spring-boot:run
# App starts on http://localhost:8080
# H2 console: http://localhost:8080/h2-console (JDBC URL: jdbc:h2:file:./data/quiz-platform)
```

### 4.3 Backend + MySQL via Docker Compose

```bash
# Copy and fill in env file
cp .env.example .env
# Edit .env — set all required values (see §5)

# Build the JAR first (Compose uses the standard Dockerfile which needs a pre-built JAR)
mvn -B -ntp -DskipTests package

# Start everything
docker compose up --build

# Tear down (keeps volumes / DB data)
docker compose down

# Tear down and wipe all data
docker compose down -v
```

### 4.4 Frontend (glass-ui Storybook)

```bash
cd glass-ui
npm ci
npm run storybook          # http://localhost:6006

# Run all checks
npm run lint
npm run typecheck
npm test -- --watchAll=false
npm run build
npm run build-storybook
```

### 4.5 Static frontend against local backend

Open `src/main/resources/static/index.html` directly in a browser while the
backend runs on `localhost:8080`. The frontend auto-detects same-origin when
`API_BASE_URL` is empty.

Alternatively serve it:
```bash
npx serve src/main/resources/static -p 3000
# then navigate to http://localhost:3000
```

---

## 5. Environment Variables

### Backend (Spring Boot)

| Variable | Default | Required in prod | Notes |
|---|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `default` (H2) | Yes — set `prod` | Activates MySQL datasource |
| `SERVER_PORT` | `8080` | No | Override if needed |
| `DB_URL` | H2 file URL | Yes | `jdbc:mysql://host:3306/quiz_platform` |
| `DB_USERNAME` | `sa` | Yes | MySQL user |
| `DB_PASSWORD` | *(empty)* | Yes | MySQL password |
| `JWT_SECRET_BASE64` | Dev sample key | **Yes — replace** | Base64 HMAC key ≥32 bytes |
| `JWT_EXPIRATION_SECONDS` | `3600` | No | Token lifetime in seconds |
| `APP_ALLOWED_ORIGINS` | `localhost:3000` | Yes | Comma-separated CORS origins |

> **Security:** The dev sample `JWT_SECRET_BASE64` in `application.properties` is
> public. Always set a new value in production via environment variable — never
> commit secrets to source control.

### Frontend (build-time injection)

| GitHub Variable | Where set | Purpose |
|---|---|---|
| `API_BASE_URL` | Settings → Actions → Variables | Backend Railway URL baked into `config.js` |

---

## 6. CI/CD Pipeline

### Workflows

| File | Triggers | Purpose |
|---|---|---|
| `backend-ci.yml` | Push/PR on `src/**`, `pom.xml`, `Dockerfile` | Build, test, Docker build, docker-compose validate |
| `glass-ui-ci.yml` | Push/PR on `glass-ui/**` | Lint, typecheck, tests, build, Storybook — matrix Node 18/20/22 |
| `glass-ui-release.yml` | Push tags `v*` | Publish glass-ui to npm |
| `frontend-pages-deploy.yml` | Push to branch on `static/**` or `glass-ui/**` | Deploy frontend + Storybook to GitHub Pages |
| CodeQL | Scheduled + push | Static security analysis of Java |

### Branch strategy

```
copilot/build-java-quiz-platform  ← active dev branch (all CI runs here)
         │
         ▼ PR when ready
       main  ← stable; Pages workflow also triggers here once merged
```

---

## 7. Rollback

### GitHub Pages rollback

GitHub Pages keeps the previous deployment. To roll back:

1. Go to **Settings → Pages**.
2. Or re-run the previous successful **frontend-pages-deploy** workflow run
   from **Actions → workflow run → Re-run jobs**.

### Railway rollback

```bash
# List recent deployments
railway deployments

# Roll back to a previous deployment
railway rollback <deployment-id>
```

Or from the Railway dashboard: **Deployments** tab → click any past deployment
→ **Rollback to this deploy**.

### Database rollback

Flyway does not provide automatic down-migrations. To revert a schema change:

1. Write a new migration `V3__revert_<description>.sql`
2. Deploy — Flyway applies it on next startup

For emergency recovery:
```bash
# Railway MySQL shell
railway connect MySQL

# Inside MySQL:
SHOW TABLES;
-- Inspect state, then run manual SQL as needed
```

---

## 8. Verification Checklist

Run this after every deploy to confirm everything is healthy.

### GitHub Pages

- [ ] `https://<user>.github.io/Quiz-Platform/` loads the dark quiz UI
- [ ] Browser title reads **Quiz Platform Live**
- [ ] Nav bar renders 7 items: Landing · Auth · Dashboard · Host · Join · Live · Leaderboard
- [ ] `https://<user>.github.io/Quiz-Platform/storybook/` loads Storybook
- [ ] Storybook shows GlassButton, GlassCard, GlassBadge, GlassHeader, GlassModal, GlassToast, GlassTooltip

### Railway Backend

- [ ] `GET /actuator/health` → `{"status":"UP"}`
- [ ] `POST /auth/register` with `{name, email, password, role:"HOST"}` → 200 + `accessToken`
- [ ] `POST /auth/login` with same credentials → 200 + `accessToken`
- [ ] `GET /dsa/insights` with Bearer token → 200 + DSA payload
- [ ] `POST /session/create` with token → 200 + `sessionId`
- [ ] `GET /demo/start` (public) → 200 + demo session

### End-to-end (frontend ↔ backend)

- [ ] Open live app, click **Start Demo Quiz** → lobby appears (network call succeeds)
- [ ] Browser DevTools → Network: no CORS errors on API calls
- [ ] Register / login flow completes and redirects to Dashboard
- [ ] Create a session, join from a second browser tab, start quiz — both clients receive questions

### CI checks

- [ ] `backend-ci / validate` → ✅ green
- [ ] `glass-ui-ci / validate (18, 20, 22)` → ✅ green (all three matrix jobs)
- [ ] `CodeQL` → ✅ green
- [ ] `frontend-pages-deploy` → ✅ green (deploy URL visible in job output)
