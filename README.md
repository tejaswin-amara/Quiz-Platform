# 🎓 Online Quiz Platform Using Data Structures and Algorithms (DSA-2)

---

## 🚀 Overview

This project is a **full-stack, real-time quiz platform** designed to demonstrate the **practical application of advanced Data Structures and Algorithms (DSA-2)** in a real-world system.

It enables users to **host, join, and participate in live quizzes** while internally leveraging optimized algorithms for efficient processing, ranking, analytics, and recommendations.

---

## 🎯 Key Highlights

* ✅ Full-stack application (Backend + Frontend)
* ✅ Real-time quiz sessions (Kahoot-style experience)
* ✅ All major **DSA-2 concepts implemented manually**
* ✅ Strong integration of algorithms into real features
* ✅ Designed for both **academic evaluation and real usage**

---

## 🧠 DSA-2 Concepts Implemented

### 🌲 Trees

* **Binary Search Tree (BST)**

  * Used for storing and retrieving quiz questions efficiently
  * Supports insert, search, delete, and traversal

* **Segment Tree**

  * Used for efficient score range queries and analytics

---

### 🌐 Graph Algorithms

* **BFS & DFS** → Topic traversal and recommendations
* **Topological Sort** → Learning sequence / topic flow

---

### ⚡ Heap (Priority Queue)

* Custom Max Heap implementation
* Used for **real-time leaderboard ranking**

---

### 🧠 Dynamic Programming

* **0/1 Knapsack** → Optimal quiz/question selection
* **Longest Increasing Subsequence (LIS)** → Performance trend tracking

---

## 🔗 DSA Integration Mapping

| Feature            | DSA Used             |
| ------------------ | -------------------- |
| Question Storage   | BST                  |
| Question Retrieval | BST Traversal        |
| Leaderboard        | Heap                 |
| Recommendations    | Graph (BFS/DFS/Topo) |
| Quiz Optimization  | Knapsack (DP)        |
| Performance Trends | LIS                  |
| Score Analytics    | Segment Tree         |

---

## 🏗️ System Architecture

### 🔹 Backend

* Java + Spring Boot
* RESTful APIs
* Modular service-based architecture

### 🔹 Frontend

* HTML, CSS, JavaScript
* Multi-screen interactive UI
* Polling-based real-time updates

### 🔹 Database

* MySQL / H2 (configurable)

---

## ⚙️ Features

### 👨‍🏫 Host

* Create quiz sessions
* Start live quizzes
* Monitor participants

### 👨‍🎓 Participants

* Join using session code
* Answer questions in real-time
* View live leaderboard

### 📊 Intelligent System

* Algorithm-driven question selection
* Real-time leaderboard updates
* Performance analytics

---

## 🔄 Live Quiz Flow

1. Host creates a session
2. Participants join using a code
3. Lobby shows players joining
4. Quiz starts → timed questions
5. Users submit answers
6. Scores calculated instantly
7. Leaderboard updates dynamically
8. Final results + analytics displayed

---

## 🌐 API Endpoints

### Session Management

* `POST /session/create`
* `POST /session/join`
* `GET /session/{id}/question`
* `POST /session/{id}/answer`
* `GET /session/{id}/leaderboard`
* `GET /session/{id}/results`

---

## 📊 Performance Analysis

| Algorithm                  | Complexity |
| -------------------------- | ---------- |
| BST (Insert/Search/Delete) | O(h)       |
| Heap (Insert/Delete)       | O(log n)   |
| Graph Traversal (BFS/DFS)  | O(V + E)   |
| Segment Tree Query         | O(log n)   |
| Knapsack (DP)              | O(n × W)   |

---

## 🧪 Testing

* ✅ Unit tests for DSA modules
* ✅ API tests for session flow
* ✅ Integration tests for leaderboard and analytics

All tests passing:

```
mvn test
```

---

## 🚀 Getting Started

### Prerequisites

* Java 17+
* Maven
* MySQL (optional, H2 supported)

---

### Run Backend

```
mvn spring-boot:run
```

---

### Access Application

Open in browser:

```
http://localhost:8080
```

---

## 📁 Project Structure

```
/src
 ├── controller
 ├── service
 ├── dto
 ├── model
 ├── dsa
 ├── resources/static (frontend)
 └── test
```

---

## 📸 Screenshots

*(Add your screenshots here)*

Example:
![Quiz UI](https://github.com/user-attachments/assets/6bead3e0-a69e-47c9-9c72-ee1da0bab0b2)

---

## 🎯 Course Outcome (DSA-2) Coverage

| CO  | Topic                     | Status    |
| --- | ------------------------- | --------- |
| CO1 | Trees (BST, Segment Tree) | ✅         |
| CO2 | Graph Algorithms          | ✅         |
| CO3 | Heap                      | ✅         |
| CO4 | Dynamic Programming       | ✅         |
| CO5 | Real-world Application    | 🔥 Strong |

---

## 🎤 Viva Notes (Quick Reference)

* BST ensures efficient question retrieval
* Heap maintains real-time ranking
* Graph models topic relationships
* DP optimizes quiz generation
* Segment Tree enables fast analytics

---

## 🏁 Conclusion

This project demonstrates how **advanced DSA-2 concepts** can be effectively applied in a real-world system to improve **efficiency, scalability, and user experience**.

It bridges the gap between **theory and practice** by integrating algorithms into a fully functional application.

---

## 👤 Author

**Tejaswin Amara**
