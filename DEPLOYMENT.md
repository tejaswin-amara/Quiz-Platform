# Deployment Guide

## Recommended production architecture

- **Frontend hosting:** GitHub Pages (lowest cost) or Cloudflare Pages
- **Backend hosting:** Railway or Render (Docker deploy)
- **Database hosting:** Railway MySQL or any managed MySQL service

### Why GitHub Pages alone is not enough

GitHub Pages serves only static files (HTML/CSS/JS).  
This project also requires:
- a **Spring Boot API** process running continuously
- a **MySQL database** with persistent storage
- authenticated API calls and server-side JWT/session logic

So Pages can host the frontend only; backend + database must run on server infrastructure.

---

## Production environment variables

### Backend required

```env
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080
DB_URL=jdbc:mysql://<managed-mysql-host>:3306/quiz_platform
DB_USERNAME=<db-user>
DB_PASSWORD=<db-password>
JWT_SECRET_BASE64=<base64-encoded-random-secret>
JWT_EXPIRATION_SECONDS=3600
APP_ALLOWED_ORIGINS=https://<your-frontend-domain>
```

### Frontend (static)

Set API base URL in `config.js`:

```js
window.__QUIZ_PLATFORM_CONFIG__ = {
  apiBaseUrl: "https://<your-backend-domain>"
};
```

If left empty, frontend uses same-origin API calls.

---

## Backend deployment (Railway/Render)

1. Create a new service from this repository.
2. Use Docker deployment (project `Dockerfile`).
3. Set backend environment variables listed above.
4. Attach a persistent managed MySQL instance.
5. Ensure `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` point to that DB.
6. Expose port `8080` (or set `SERVER_PORT` accordingly).
7. Confirm health endpoint returns `UP` at `/actuator/health`.

---

## Database setup

1. Create MySQL database `quiz_platform`.
2. Create least-privilege application user.
3. Allow only backend service network access (no public wildcard).
4. Configure automated backups/snapshots.
5. Validate Flyway migrations run on first startup.

---

## Frontend deployment (GitHub Pages)

This repository includes `.github/workflows/frontend-pages-deploy.yml`.

1. In GitHub repository settings, enable **Pages** with **GitHub Actions** source.
2. Add repository variable:
   - `API_BASE_URL=https://<your-backend-domain>`
3. Push to `main` (or manually run workflow dispatch).
4. Workflow publishes `src/main/resources/static` as Pages artifact.
5. Verify frontend calls backend domain from `config.js`.

### Cloudflare Pages alternative

1. Connect repository and deploy `src/main/resources/static`.
2. Set/build `config.js` with backend URL.
3. Keep backend CORS `APP_ALLOWED_ORIGINS` aligned to Cloudflare domain.

---

## Production startup checklist

- [ ] Managed MySQL created and reachable by backend
- [ ] Backend env vars configured (`prod`, DB, JWT, CORS)
- [ ] `APP_ALLOWED_ORIGINS` includes only real frontend domains
- [ ] Backend health endpoint returns `UP`
- [ ] Frontend `apiBaseUrl` points to backend HTTPS URL
- [ ] Frontend successfully performs login/register and session APIs
- [ ] TLS/HTTPS enabled on frontend and backend domains

---

## Rollback checklist

- [ ] Keep last known-good backend image/version tag
- [ ] Keep last known-good frontend artifact/config.js
- [ ] Roll backend service to previous release
- [ ] Restore previous frontend deployment
- [ ] Re-verify `/actuator/health`
- [ ] Run smoke test: auth login, create session, join session, submit answer

