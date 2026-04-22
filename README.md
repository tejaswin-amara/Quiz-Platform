# Online Quiz Platform Using DSA-2 (Spring Boot + MySQL + Live Quiz UX)

A full-stack Java quiz platform where DSA-2 algorithms are manually implemented and now enhanced with a Kahoot-style real-time interaction layer.

## Tech Stack
- Backend: Java 17, Spring Boot
- Frontend: HTML/CSS/JavaScript (multi-screen live flow in static resources)
- Database: MySQL (config included)

## DSA-2 Implementations and Feature Mapping
| Feature | DSA Used | File |
|---|---|---|
| Question storage/retrieval | Binary Search Tree (insert/search/delete/traversal) | `dsa/QuestionBST.java` |
| Topic recommendations | Graph + BFS/DFS/Topological Sort | `dsa/TopicGraph.java` |
| Leaderboard ranking | Manual Max Heap (Priority Queue) | `dsa/MaxHeap.java` |
| Quiz optimization | 0/1 Knapsack (DP) | `dsa/DynamicProgrammingUtils.java` |
| Performance trend | LIS (DP) | `dsa/DynamicProgrammingUtils.java` |
| Score analytics | Segment Tree range query | `dsa/SegmentTree.java` |

## Live Quiz Enhancement Layer (Kahoot-style UX)
The existing DSA-backed system is upgraded with a real-time session flow:
1. Host creates a session
2. Players join via session code
3. Waiting lobby shows player count
4. Host starts live quiz
5. Timer-based question progression (polling every ~2.5 seconds)
6. Players answer each question
7. Leaderboard updates continuously
8. Results view shows final ranking + analytics

## Session APIs (New)
- `POST /session/create` - create live session
- `POST /session/join?sessionId={id}` - join existing live session
- `GET /session/{id}/question?start=true|false` - fetch current question / start by host
- `POST /session/{id}/answer` - submit answer for current question
- `GET /session/{id}/leaderboard` - heap-based live ranking
- `GET /session/{id}/results` - final leaderboard + Segment Tree + LIS analytics

## Existing APIs (Preserved)
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

## Time Complexity Output (also available in API)
- BST Insert/Search/Delete: `O(h)`
- Heap Insert/ExtractMax: `O(log n)`
- BFS/DFS/Topological Sort: `O(V + E)`
- Knapsack DP: `O(n × W)`
- LIS DP: `O(n²)`
- Segment Tree Range Query: `O(log n)`

## Run Instructions
1. Ensure Java 17+ and Maven are installed.
2. Configure MySQL (optional for this DSA-focused in-memory runtime):
   - DB: `quiz_platform`
   - Update credentials in `src/main/resources/application.properties`
3. Start app:
   ```bash
   mvn spring-boot:run
   ```
4. Open UI:
   - `http://localhost:8080`

## Run Tests
```bash
mvn test
```

## Verification Notes
- Existing DSA modules are preserved and still power backend features.
- New UI/UX is an enhancement layer, not a rewrite.
- Added tests for live session service flow and session API responses.
