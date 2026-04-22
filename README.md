# Online Quiz Platform Using DSA-2 (Spring Boot + MySQL + HTML/CSS/JS)

A full-stack Java quiz platform where each required DSA-2 concept is manually implemented and directly used in a real feature.

## Tech Stack
- Backend: Java 17, Spring Boot
- Frontend: HTML/CSS/JavaScript (served from Spring static resources)
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

## API Features
- `POST /api/questions` - create question
- `DELETE /api/questions/{id}` - delete question (BST delete)
- `GET /api/questions` - list questions in BST inorder
- `POST /api/quizzes` - create quiz
- `GET /api/quizzes/{code}/questions` - fetch quiz questions (BST search)
- `POST /api/quizzes/{code}/join` - join quiz
- `POST /api/quizzes/{code}/submit` - submit answers
- `GET /api/quizzes/{code}/leaderboard` - leaderboard (Heap)
- `POST /api/quizzes/{code}/optimize?maxWeight=6` - optimize set (Knapsack)
- `GET /api/quizzes/{code}/analytics?left=0&right=2&participantId=...` - analytics (Segment Tree + LIS)
- `GET /api/recommendations?topic=Arrays&mode=bfs|dfs|topo` - graph traversal recommendations
- `GET /api/complexities` - complexity output for viva

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
3. Start backend + frontend:
   ```bash
   mvn spring-boot:run
   ```
4. Open UI:
   - `http://localhost:8080`

## Run Tests
```bash
mvn test
```

## Viva-Friendly Notes
- Every mandatory DSA-2 topic is implemented manually in dedicated classes.
- Each algorithm is wired into a visible user feature (no unused algorithm).
- UI demonstrates create/join/submit/leaderboard/recommendation flows.
