# Security Policy

## Supported Versions

Quiz Platform is at `v0.0.1` and under active development. Security fixes land on `main` only.

## Reporting a Vulnerability

Please **do not open a public issue** for a security report. Instead, reach out directly via [GitHub](https://github.com/tejaswin-amara) or the contact on the [author's profile](https://linkedin.com/in/tejaswin-amara). Include:

- A description of the issue and its impact
- Steps to reproduce
- Any relevant logs or requests (with secrets redacted)

## Security Model

| Control | Implementation |
|---|---|
| Authentication | JWT (`jjwt` 0.12.6), stateless bearer tokens |
| Password storage | BCrypt hashing |
| Authorization | Role-based access control (`UserRole`), plus session-ownership checks on host-only endpoints |
| Secrets | Environment-driven — `JWT_SECRET_BASE64`, DB credentials — never committed; see `.env.example` |
| CORS | Restricted via `APP_ALLOWED_ORIGINS`; no wildcard in production |
| Input validation | `spring-boot-starter-validation` on request DTOs |
| Error handling | Centralized via `ApiExceptionHandler` — no stack traces leaked to clients |
| Transport | Deployed behind HTTPS (Railway and GitHub Pages both terminate TLS) |

`glass-ui` has its own [security policy](./glass-ui/SECURITY.md) scoped to the component library.

## Scope

This covers the Spring Boot backend, the `glass-ui` frontend library, and the CI/CD workflows in this repository. Third-party dependency vulnerabilities should be reported upstream (Dependabot/Renovate are configured to keep dependencies current — see `.github/dependabot.yml` and `.github/renovate.json`).
