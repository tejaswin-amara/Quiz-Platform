# API Reference

Base URL: `http://localhost:8080` locally — see [DEPLOYMENT.md](./DEPLOYMENT.md) for the production Railway URL.

All endpoints except `/auth/*` and `/demo/start` expect an `Authorization: Bearer <jwt>` header. See [SECURITY.md](./SECURITY.md) for the auth model.

## Auth — `AuthController` (`/auth`)

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Log in, receive a JWT |

## Quiz & Question — `QuizController` (`/api`)

| Method | Path | Description |
|---|---|---|
| POST | `/api/questions` | Create a question |
| GET | `/api/questions` | List questions |
| DELETE | `/api/questions/{id}` | Delete a question |
| POST | `/api/quizzes` | Create a quiz |
| GET | `/api/quizzes/{code}/questions` | Get a quiz's questions |
| POST | `/api/quizzes/{code}/join` | Join a quiz by code |
| POST | `/api/quizzes/{code}/submit` | Submit quiz answers |
| GET | `/api/quizzes/{code}/leaderboard` | Get quiz leaderboard (Max Heap) |
| GET | `/api/quizzes/{code}/analytics` | Get quiz analytics (Segment Tree) |
| POST | `/api/quizzes/{code}/optimize` | Run DP-based quiz/difficulty optimization |
| GET | `/api/recommendations` | Get topic recommendations (Graph traversal) |
| GET | `/api/complexities` | Get algorithmic complexity metadata |

## Live Sessions — `SessionController` (`/session`)

| Method | Path | Description |
|---|---|---|
| POST | `/session/create` | Create a live session |
| POST | `/session/join` | Join a live session |
| GET | `/session/{id}/question` | Get the current question |
| POST | `/session/{id}/answer` | Submit an answer |
| GET | `/session/{id}/leaderboard` | Live leaderboard |
| GET | `/session/{id}/results` | Session results |
| POST | `/session/{id}/pause` | Host: pause session |
| POST | `/session/{id}/resume` | Host: resume session |
| POST | `/session/{id}/end` | Host: end session |
| POST | `/session/{id}/close-lobby` | Host: close the lobby |
| POST | `/session/{id}/force-next` | Host: force the next question |
| POST | `/session/{id}/participants/{participantId}/remove` | Host: remove a participant |
| GET | `/session/{id}/answers/review` | Review submitted answers |

## Demo — `DemoController` (`/demo`)

| Method | Path | Description |
|---|---|---|
| GET | `/demo/start` | Seed a full demo session in one call |

## DSA Insights — `DsaController` (`/dsa`)

| Method | Path | Description |
|---|---|---|
| GET | `/dsa/insights` | Live view into BST / Heap / Graph / Segment Tree operations |

---

*This reference is generated from the current controller source — 30 endpoints across 5 controllers. If you add or change a mapping, update this file in the same PR.*
