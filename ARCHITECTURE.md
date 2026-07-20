# 🏛️ Architecture

## 🏗️ System Overview

```text
┌───────────────────────────┐
│      glass-ui (React)     │
│  TypeScript · styled-     │
│  components · framer-     │
│  motion                   │
└─────────────┬─────────────┘
              │ REST (JWT bearer)
              ▼
┌───────────────────────────┐
│      Spring Boot API      │
│  auth · controller ·      │
│  service · security ·     │
│  dsa                      │
└─────────────┬─────────────┘
              │ Spring Data JPA / Hibernate
              ▼
┌───────────────────────────┐
│  MySQL 8.0 (H2 locally)   │
│  Flyway-managed schema    │
└───────────────────────────┘
```

## 🔄 Live Session Flow

```text
Host creates session
        │
        ▼
Participants join
        │
        ▼
Lobby
        │
        ▼
Quiz starts
        │
        ▼
Questions delivered
        │
        ▼
Answers submitted
        │
        ▼
Leaderboard updates
        │
        ▼
Results generated
        │
        ▼
Analytics produced
```

## 🧠 DSA → Feature Mapping

Every "smart" feature is backed by a specific data structure in `src/main/java/com/tejaswin/quizplatform/dsa/`, not a generic library call.

| Structure | File | Backs | Complexity |
|---|---|---|---|
| Binary Search Tree | `QuestionBST.java` | Question storage & retrieval | Search / Insert / Delete: O(log n) |
| Graph (BFS, DFS, Topological Sort) | `TopicGraph.java` | Topic dependency analysis, recommendation generation | — |
| Max Heap | `MaxHeap.java` | Real-time leaderboard ranking | Insert / Update / Extract-max: O(log n) |
| Dynamic Programming (Knapsack, LIS) | `DynamicProgrammingUtils.java` | Quiz/difficulty optimization; performance trend tracking | — |
| Segment Tree | `SegmentTree.java` | Range score queries, aggregate analytics | Query / Update: O(log n) |

A live view into these operations is exposed via `GET /dsa/insights` and surfaced in the frontend's DSA Insights panel — e.g. `BST Search → Question Retrieved`, `Heap Updated → Leaderboard Recalculated`, `Graph Traversal → Recommendation Generated`.

## 🚀 Demo Mode

```http
GET /demo/start
```

One call seeds a full session — sample questions, demo participants, leaderboard data — for presentations, vivas, or quick manual testing. See `DemoController.java`.

## 💾 Core Entities

`src/main/java/com/tejaswin/quizplatform/persistence/entity/`

```
UserEntity · UserRole
QuizEntity · QuestionEntity
SessionEntity · PlayerEntity
ResultEntity · QuizResultEntity
```

Persisted via Spring Data JPA + Hibernate, with schema versioned through Flyway migrations in `src/main/resources/db`.

## 🖥️ Frontend Screens (`glass-ui`)

Home · Login · Register · Dashboard · Create Session · Join Session · Lobby · Live Quiz · Leaderboard · Results · Profile · Settings · DSA Insights Panel

## 📦 Package Boundaries

- **`src/`** — the Spring Boot backend, standard Maven layout, deployed to Railway.
- **`glass-ui/`** — an independent, MIT-licensed npm package (`build:lib` via `tsup`) with its own CI (`glass-ui-ci`, `glass-ui-release`), lint/typecheck/test scripts, and Storybook. It's consumable outside this repo.

See [API.md](./API.md) for the full endpoint reference and [DEPLOYMENT.md](./DEPLOYMENT.md) for how the pieces are actually deployed.
