# Quiz Platform

> A full-stack, production-ready quiz platform built with Spring Boot, MySQL, and a modern glassmorphism-inspired UI. The platform combines real-time quiz hosting with practical implementations of Data Structures & Algorithms (DSA), making it both an interactive learning system and a showcase of core computer science concepts.

[![backend-ci](https://github.com/tejaswin-amara/Quiz-Platform/actions/workflows/backend-ci.yml/badge.svg?branch=main)](https://github.com/tejaswin-amara/Quiz-Platform/actions/workflows/backend-ci.yml)
[![glass-ui-ci](https://github.com/tejaswin-amara/Quiz-Platform/actions/workflows/glass-ui-ci.yml/badge.svg?branch=main)](https://github.com/tejaswin-amara/Quiz-Platform/actions/workflows/glass-ui-ci.yml)
[![Pages](https://github.com/tejaswin-amara/Quiz-Platform/actions/workflows/frontend-pages-deploy.yml/badge.svg?branch=main)](https://tejaswin-amara.github.io/Quiz-Platform/)
![Java](https://img.shields.io/badge/Java-17+-orange)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.5-brightgreen)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)
![JWT](https://img.shields.io/badge/Auth-JWT-success)
![Version](https://img.shields.io/badge/Version-v0.0.1-blue)

**🌐 Live app:** https://tejaswin-amara.github.io/Quiz-Platform/  
**📖 Storybook:** https://tejaswin-amara.github.io/Quiz-Platform/storybook/  
**🚀 Backend:** Deploy to Railway — see [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## Overview

Quiz Platform is a real-time quiz hosting and analytics system designed to demonstrate practical applications of Data Structures & Algorithms through a complete end-to-end software product.

The platform supports:

- Live multiplayer quiz sessions
- Real-time leaderboards
- Topic recommendations
- Performance analytics
- Demo mode for presentations and viva demonstrations
- JWT authentication and authorization
- Docker-based deployment
- Persistent database storage
- Interactive DSA visualizations

---

## Features

### Quiz Management

- Create quizzes
- Manage questions
- Host live quiz sessions
- Join using session codes
- Timed questions
- Automatic progression
- Session recovery support

### Real-Time Multiplayer

- Live lobby
- Participant management
- Dynamic score updates
- Real-time rankings
- Session results tracking
- Host controls

### Analytics

- Individual performance reports
- Topic-wise analysis
- Score trends
- Range score queries
- Difficulty impact analysis
- Learning recommendations

### Security

- JWT Authentication
- BCrypt password hashing
- Role-Based Authorization
- Session ownership validation
- Environment-based secrets
- Secure CORS configuration

### Production Features

- Flyway database migrations
- Docker deployment
- Health monitoring
- CI/CD workflows
- Persistent storage
- Environment-driven configuration

---

# DSA Integration

This project demonstrates DSA-2 concepts through practical implementation.

## Binary Search Tree (BST)

### Purpose

Efficient storage and retrieval of quiz questions.

### Operations

- Insert
- Search
- Delete
- Traversals

### Complexity

| Operation | Complexity |
|------------|------------|
| Search | O(log n) |
| Insert | O(log n) |
| Delete | O(log n) |

---

## Graph Algorithms

### Purpose

Topic dependency analysis and recommendation generation.

### Algorithms

- Breadth First Search (BFS)
- Depth First Search (DFS)
- Topological Sort

### Usage

- Topic recommendations
- Learning paths
- Dependency analysis

---

## Max Heap

### Purpose

Real-time leaderboard ranking.

### Operations

- Insert Score
- Extract Maximum
- Update Ranking

### Complexity

| Operation | Complexity |
|------------|------------|
| Insert | O(log n) |
| Update | O(log n) |
| Extract Max | O(log n) |

---

## Dynamic Programming

### Knapsack

Used for:

- Quiz optimization
- Topic selection
- Difficulty balancing

### Longest Increasing Subsequence (LIS)

Used for:

- Performance trend analysis
- Learning progression tracking

---

## Segment Tree

### Purpose

Efficient analytics computation.

### Usage

- Range score queries
- Aggregate analytics
- Session statistics

### Complexity

| Operation | Complexity |
|------------|------------|
| Query | O(log n) |
| Update | O(log n) |

---

# System Architecture

```text
┌──────────────────────────┐
│        Frontend          │
│   HTML • CSS • JS        │
└────────────┬─────────────┘
             │ REST APIs
             ▼
┌──────────────────────────┐
│     Spring Boot API      │
│ Authentication           │
│ Sessions                 │
│ Analytics                │
│ Recommendations          │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│         MySQL            │
│ Flyway Migrations        │
│ Persistent Storage       │
└──────────────────────────┘
```

---

# Live Session Flow

```text
Host Creates Session
        │
        ▼
Participants Join
        │
        ▼
Lobby
        │
        ▼
Quiz Starts
        │
        ▼
Questions Delivered
        │
        ▼
Answers Submitted
        │
        ▼
Leaderboard Updates
        │
        ▼
Results Generated
        │
        ▼
Analytics Produced
```

---

# Demo Mode

The platform includes a one-click demonstration flow.

## Endpoint

```http
GET /demo/start
```

Demo Mode automatically:

- Creates a session
- Loads sample questions
- Adds demo participants
- Generates leaderboard data
- Demonstrates DSA integrations

Perfect for:

- Project demonstrations
- Viva presentations
- Quick testing

---

# Frontend Screens

Implemented screens include:

- Home
- Login
- Register
- Dashboard
- Create Session
- Join Session
- Lobby
- Live Quiz
- Leaderboard
- Results
- Profile
- Settings
- Thank You Screen
- DSA Insights Panel

---

# DSA Insights Dashboard

The platform visualizes internal DSA operations.

Examples:

```text
BST Search → Question Retrieved

Heap Updated →
Leaderboard Recalculated

Graph Traversal →
Recommendation Generated

Segment Tree Query →
Analytics Produced

LIS Analysis →
Performance Trend Updated
```

---

# REST API

## Authentication

```http
POST /auth/register
POST /auth/login
```

### Quiz APIs

```http
POST   /api/quizzes
GET    /api/quizzes
GET    /api/quizzes/{id}
DELETE /api/quizzes/{id}
```

### Session APIs

```http
POST /session/create
POST /session/join
GET  /session/{id}/question
POST /session/{id}/answer
GET  /session/{id}/leaderboard
GET  /session/{id}/results
```

### Analytics APIs

```http
GET /api/analytics
GET /api/optimize
GET /api/recommendations
GET /dsa/insights
```

---

# Database

Core entities:

```text
QuestionEntity
QuizEntity
SessionEntity
PlayerEntity
ResultEntity
UserEntity
```

Persistence stack:

- Spring Data JPA
- Hibernate
- Flyway Migrations

---

# Security

Implemented protections:

- JWT Authentication
- BCrypt Password Hashing
- Role-Based Access Control
- Session Ownership Validation
- Environment-Based Secrets
- Secure CORS Restrictions
- Request Validation
- Global Exception Handling

---

# Environment Variables

```env
SPRING_PROFILES_ACTIVE=prod

SERVER_PORT=8080

DB_URL=jdbc:mysql://localhost:3306/quiz_platform
DB_USERNAME=app_user
DB_PASSWORD=strong_password

JWT_SECRET_BASE64=your_base64_secret
JWT_EXPIRATION_SECONDS=3600

APP_ALLOWED_ORIGINS=https://yourdomain.com

SLOW_REQUEST_THRESHOLD_MS=1000
```

---

# Local Development

## Backend

```bash
mvn clean verify
mvn spring-boot:run
```

Open:

```text
http://localhost:8080
```

---

# Docker Deployment

## Build

```bash
docker compose build
```

## Start

```bash
docker compose up -d
```

## Health Check

```bash
curl http://localhost:8080/actuator/health
```

Expected response:

```json
{
  "status": "UP"
}
```

---

# Testing

## Backend

```bash
mvn clean verify
```

## Glass UI

```bash
npm run lint
npm run typecheck
npm test -- --watchAll=false
npm run build
npm run build:lib
npm run build-storybook
```

---

# Deployment Architecture

## Recommended Production Stack

```text
Frontend
└── GitHub Pages / Cloudflare Pages

Backend
└── Railway / Render / VPS

Database
└── Managed MySQL
```

### Why?

GitHub Pages can host only static frontend assets.

It cannot host:

- Spring Boot applications
- Java processes
- MySQL databases

Therefore:

- Frontend → Static Hosting
- Backend → Application Host
- Database → Managed Database

---

# CI/CD

Automated workflows include:

- Backend Validation
- Frontend Validation
- Glass UI Validation
- Build Verification
- Deployment Checks

---

# Monitoring Checklist

Monitor:

- Health Endpoint
- API Errors
- Login Failures
- Database Connectivity
- Session Creation Rate
- Container Restarts
- Memory Usage
- Query Latency

---

# Release

Current Release:

```text
v0.0.1
```

Release Status:

```text
Production Ready
Deployment Ready
Security Hardened
Docker Ready
Flyway Ready
CI/CD Enabled
```

---

# Educational Value

This project demonstrates practical implementations of:

- Trees
- Graphs
- Heaps
- Dynamic Programming
- Segment Trees
- REST APIs
- Authentication
- Database Design
- Docker Deployment
- Full-Stack Development

Suitable for:

- DSA-2 Academic Projects
- Portfolio Showcase
- Technical Demonstrations
- Learning Platforms
- Real Quiz Hosting

---

# License

This project is intended for educational and learning purposes.

---

# Final Status

✅ Full-Stack Application  
✅ Real-Time Quiz Platform  
✅ DSA-Integrated Architecture  
✅ Production Ready  
✅ Docker Ready  
✅ Security Hardened  
✅ Deployment Ready  
✅ Viva Demonstration Ready  
✅ Portfolio Ready  
✅ Ready for Real Quiz Hosting