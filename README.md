# Quiz Platform

> A full-stack, real-time multiplayer quiz platform combining live quiz hosting with practical Data Structures & Algorithms implementations — Spring Boot backend, a glassmorphism React component library (`glass-ui`) on the frontend.

[![backend-ci](https://github.com/tejaswin-amara/Quiz-Platform/actions/workflows/backend-ci.yml/badge.svg?branch=main)](https://github.com/tejaswin-amara/Quiz-Platform/actions/workflows/backend-ci.yml)
[![glass-ui-ci](https://github.com/tejaswin-amara/Quiz-Platform/actions/workflows/glass-ui-ci.yml/badge.svg?branch=main)](https://github.com/tejaswin-amara/Quiz-Platform/actions/workflows/glass-ui-ci.yml)
[![Pages](https://github.com/tejaswin-amara/Quiz-Platform/actions/workflows/frontend-pages-deploy.yml/badge.svg?branch=main)](https://tejaswin-amara.github.io/Quiz-Platform/)
![Java](https://img.shields.io/badge/Java-17+-orange)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.5-brightgreen)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

**🌐 Live app:** https://tejaswin-amara.github.io/Quiz-Platform/
**📖 Storybook:** https://tejaswin-amara.github.io/Quiz-Platform/storybook/
**🚀 Deploy guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## What it is

Quiz Platform is a real-time quiz hosting and analytics system built to demonstrate DSA-2 coursework through a complete, working product rather than isolated algorithm exercises. Every core operation — question storage, live leaderboard ranking, topic recommendations, analytics — is backed by a specific data structure, not a generic library call.

- **Live multiplayer sessions** — host a quiz, share a code, participants join a lobby, questions run live with automatic progression
- **Real-time leaderboard & analytics** — score-driven rankings, topic-wise breakdowns, performance trends
- **JWT-secured, role-based access** with BCrypt hashing and environment-driven secrets
- **Demo mode** (`GET /demo/start`) that seeds a full session for viva/presentation use in one call
- **`glass-ui`** — a standalone, MIT-licensed, publishable React + styled-components glassmorphism component library with its own Storybook and CI

For the full breakdown:

| Document | Covers |
|---|---|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, session flow, DSA-to-feature mapping, complexity tables |
| [API.md](./API.md) | Full REST endpoint reference |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Local dev, Docker Compose, Railway + GitHub Pages production deploy |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Branching, commit style, CI expectations |
| [SECURITY.md](./SECURITY.md) | Security model and how to report a vulnerability |
| [glass-ui/README.md](./glass-ui/README.md) | Component library usage & Storybook |

---

## Quick Start

### Backend (Spring Boot)

Zero-config, in-memory H2 — no MySQL or Docker needed:

```bash
git clone https://github.com/tejaswin-amara/Quiz-Platform.git
cd Quiz-Platform
mvn spring-boot:run
```

- API: `http://localhost:8080`
- H2 console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:file:./data/quiz-platform`)

For MySQL via Docker Compose (production-like setup), see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Frontend (`glass-ui`)

```bash
cd glass-ui
npm install
npm start           # dev server  → http://localhost:3000
npm run storybook   # Storybook   → http://localhost:6006
```

---

## Tech Stack

| Layer | Stack |
|---|---|
| Backend | Java 17, Spring Boot 3.3.5 (Web, Security, Validation, Data JPA, Actuator) |
| Auth | JWT (`jjwt` 0.12.6), BCrypt |
| Database | MySQL 8.0 (prod) / H2 (local), Flyway migrations |
| Frontend | React 18, TypeScript, styled-components, framer-motion |
| Components | `glass-ui` — built with `tsup`, documented with Storybook |
| Infra | Docker, Docker Compose, Railway (backend), GitHub Pages (frontend) |
| CI/CD | GitHub Actions — separate pipelines for backend, `glass-ui`, and Pages deploy |

---

## Repository Layout

```
Quiz-Platform/
├── src/main/java/com/tejaswin/quizplatform/
│   ├── auth/          # AuthController, AuthService, JWT request/response DTOs
│   ├── controller/     # QuizController, SessionController, DemoController, DsaController
│   ├── dsa/            # QuestionBST, TopicGraph, MaxHeap, DynamicProgrammingUtils, SegmentTree
│   ├── persistence/    # JPA entities + repositories
│   ├── security/       # JwtService, SecurityConfig, JwtAuthenticationFilter
│   └── service/        # QuizPlatformService, SessionService, LeaderboardService, AnalyticsService
├── glass-ui/           # Standalone React component library (own package.json, CI, LICENSE)
├── .github/            # CI workflows, issue/PR templates, CODEOWNERS
├── Dockerfile / Dockerfile.railway / docker-compose.yml
└── DEPLOYMENT.md
```

---

## License

MIT — see [LICENSE](./LICENSE). `glass-ui` ships under its own [MIT license](./glass-ui/LICENSE) so it can be used independently of the rest of the platform.

## Author

**Tejaswin Amara** — [GitHub](https://github.com/tejaswin-amara) · [LinkedIn](https://linkedin.com/in/tejaswin-amara)

---

<div align="center">Star ⭐ this repo if it's useful to you.</div>
