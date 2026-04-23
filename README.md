# Quiz Platform (DSA-2 + Kahoot-style Live Sessions)

Production-hardened Spring Boot quiz platform with live sessions, demo mode, and explicit DSA visibility for viva.

## 1) System Architecture (high level)

```text
[Browser UI: Home/Create/Join/Lobby/Live/Results/Thanks + Demo]
            |
            v
[REST Controllers]
  - /api/* (core quiz + DSA features)
  - /session/* (live session flow)
  - /dsa/insights (viva visibility)
  - /demo/start (one-click demo session)
            |
            v
[Services]
  - QuizPlatformService (core quiz operations + DSA orchestration)
  - SessionService (live lifecycle, timer progression, expiry cleanup)
  - LeaderboardService (heap ranking)
  - AnalyticsService (segment tree + LIS analytics)
            |
            v
[DSA Modules + Persistence]
  - BST, Heap, Graph, DP, SegmentTree
  - H2 (default) / MySQL (prod profile)
```

## 2) DSA Mapping Table

| DSA | What it does | Where it is used | Complexity |
|---|---|---|---|
| BST | Stores/retrieves questions | Quiz creation, question fetch in live/core flows | `O(h)` |
| Max Heap | Ranks leaderboard | Live and normal leaderboard endpoints | `O(n log n)` for full rank extraction |
| Graph (BFS/DFS/Topo) | Topic recommendation order | `/api/recommendations` | `O(V + E)` |
| DP (Knapsack) | Quiz optimization by weight | `/api/quizzes/{code}/optimize` | `O(n × W)` |
| DP (LIS) | Trend scoring over attempts | Analytics and session results | `O(n²)` |
| Segment Tree | Range score aggregation | Analytics and final results | `O(log n)` query |

## 3) Live Session Flow

1. Host creates session (`POST /session/create`)
2. Players join (`POST /session/join`)
3. Lobby updates via polling
4. Host starts quiz (`GET /session/{id}/question?start=true`)
5. Timer controls question progression
6. Players submit answers (`POST /session/{id}/answer`)
7. Leaderboard refreshes (`GET /session/{id}/leaderboard`)
8. Final results (`GET /session/{id}/results`)

## 4) API Documentation

### Core API (`/api`)
- `POST /api/questions`
- `DELETE /api/questions/{id}`
- `GET /api/questions`
- `POST /api/quizzes`
- `GET /api/quizzes/{code}/questions`
- `POST /api/quizzes/{code}/join`
- `POST /api/quizzes/{code}/submit`
- `GET /api/quizzes/{code}/leaderboard`
- `POST /api/quizzes/{code}/optimize?maxWeight=6`
- `GET /api/quizzes/{code}/analytics?left=0&right=2&participantId=...`
- `GET /api/recommendations?topic=Arrays&mode=bfs|dfs|topo`
- `GET /api/complexities`

### Live session API (`/session`)
- `POST /session/create`
- `POST /session/join`
- `GET /session/{id}/question`
- `POST /session/{id}/answer`
- `GET /session/{id}/leaderboard`
- `GET /session/{id}/results`

### Demo API
- `GET /demo/start` (seeds demo questions + session + mock players in one call)

### DSA insights API
- `GET /dsa/insights`

## 5) Persistence

- Default profile: **H2 file DB** (no setup)
- Production profile: **MySQL** via `application-prod.properties`
- Persisted entities:
  - Session
  - Player
  - Question
  - Result
  - Quiz / quiz submission results (core flow compatibility)

## 6) API Usage Examples

```bash
# Create live session
curl -X POST http://localhost:8080/session/create \
  -H "Content-Type: application/json" \
  -d '{"title":"DSA Live","questionIds":[101,102],"questionDurationSeconds":12}'

# Join live session
curl -X POST http://localhost:8080/session/join \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"S1234ABCD","participantName":"Alice"}'

# Fetch DSA insights panel data
curl http://localhost:8080/dsa/insights
```
## 7) Validation, Errors, and Logging

- Request validation with Jakarta Bean Validation
- Centralized error handling via `@RestControllerAdvice`
- Structured logs for:
  - session create/start/join
  - answer submission
  - leaderboard refresh
  - session cleanup

## 8) Frontend Features

- Multi-screen flow (Home, Create, Join, Lobby, Live, Results)
- One-click **Start Demo Quiz** button (no manual setup)
- Loading indicators and better error messages
- Dynamic polling (Lobby `3s`, Live `2s`, Leaderboard `1.5s`)
- Top-3 leaderboard highlighting
- Result stats: average score, rank, difficulty impact, LIS trends
- DSA Insights panel for viva explanation
- DSA working toggle + runtime signal text
- Final Thank You screen for polished presentation

## 9) Run Locally

### Prerequisites
- Java 17+
- Maven

### Start app
```bash
mvn spring-boot:run
```

Open:
- `http://localhost:8080`
- `http://localhost:8080/h2-console` (default local profile)

## 10) Run Tests

```bash
mvn test
```

## 11) Deploy with Docker

### Build and run with compose
```bash
cp .env.example .env
docker compose up --build
```

This starts:
- `app` on `8080`
- `mysql` on `3306`

### Direct container run
```bash
docker build -t quiz-platform .
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DB_URL=jdbc:mysql://<host>:3306/quiz_platform \
  -e DB_USERNAME=<user> \
  -e DB_PASSWORD=<password> \
  -e SERVER_PORT=8080 \
  quiz-platform
```

## 12) 🎥 Demo Mode (1-click)

1. Start app (`mvn spring-boot:run` or Docker).
2. Open `http://localhost:8080`.
3. Click **Start Demo Quiz**.
4. Session + quiz + mock players are auto-created in under 10 seconds.
5. Click **Start Quiz** in lobby and present full live flow.

## 13) 🧠 DSA Explanation (simple)

- **BST** is used for question retrieval so lookups scale with tree height (`O(h)`).
- **Heap** powers rank extraction so leaderboard is always sorted by score.
- **Graph traversals** justify recommendation paths (BFS/DFS/Topo) with `O(V+E)`.
- **Knapsack DP** demonstrates optimization, and **LIS DP** demonstrates trend analysis.
- **Segment Tree** provides efficient score range aggregation for analytics.

## 14) 📸 Screenshots (UI flow)

Suggested flow captures for submission:
- Home + Demo button
- Lobby with live player count
- Live question + timer + leaderboard top-3
- Results + performance stats
- Thank You screen

Live UI screenshot sample:
- https://github.com/user-attachments/assets/6bead3e0-a69e-47c9-9c72-ee1da0bab0b2

## 15) 🎯 Why this project stands out

- Full-stack, production-style architecture with persistent state.
- Clear, demonstrable DSA-to-feature mapping for viva.
- End-to-end live quiz flow with demo mode for instant presentation.
- Deployable with Docker and environment-driven configuration.
