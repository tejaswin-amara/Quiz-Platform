package com.tejaswin.quizplatform.service;

import com.tejaswin.quizplatform.dsa.DynamicProgrammingUtils;
import com.tejaswin.quizplatform.dsa.MaxHeap;
import com.tejaswin.quizplatform.dsa.QuestionBST;
import com.tejaswin.quizplatform.dsa.SegmentTree;
import com.tejaswin.quizplatform.dsa.TopicGraph;
import com.tejaswin.quizplatform.model.LeaderboardEntry;
import com.tejaswin.quizplatform.model.Question;
import com.tejaswin.quizplatform.model.Quiz;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class QuizPlatformService {
    private static final int QUIZ_CODE_LENGTH = 6;
    private static final int POINTS_PER_DIFFICULTY_LEVEL = 10;
    private static final int DEFAULT_QUESTION_DURATION_SECONDS = 15;

    private final QuestionBST questionBST = new QuestionBST();
    private final TopicGraph topicGraph = new TopicGraph();
    private final Map<Long, Question> allQuestions = new HashMap<>();
    private final Map<String, Quiz> quizzes = new HashMap<>();
    private final Map<String, Map<String, Integer>> quizScores = new HashMap<>();
    private final Map<String, Map<String, List<Integer>>> quizScoreHistory = new HashMap<>();
    private final Map<String, String> participantNames = new HashMap<>();
    private final Map<String, LiveSession> sessions = new HashMap<>();

    public QuizPlatformService() {
        topicGraph.addEdge("Arrays", "Sliding Window");
        topicGraph.addEdge("Sliding Window", "Two Pointers");
        topicGraph.addEdge("Two Pointers", "Binary Search");
        topicGraph.addEdge("Binary Search", "Dynamic Programming");
        topicGraph.addEdge("Graphs", "Topological Sort");
        topicGraph.addEdge("Topological Sort", "Shortest Path");
    }

    public Question addQuestion(Question question) {
        allQuestions.put(question.id(), question);
        questionBST.insert(question);
        topicGraph.addTopic(question.topic());
        return question;
    }

    public Quiz createQuiz(String title, List<Long> questionIds) {
        String code = generateQuizCode();
        Quiz quiz = new Quiz(code, title, questionIds);
        quizzes.put(code, quiz);
        quizScores.put(code, new HashMap<>());
        quizScoreHistory.put(code, new HashMap<>());
        return quiz;
    }

    public Map<String, String> joinQuiz(String code, String participantName) {
        ensureQuizExists(code);
        String participantId = UUID.randomUUID().toString();
        participantNames.put(participantId, participantName);
        quizScores.get(code).put(participantId, 0);
        List<Integer> initialHistory = new ArrayList<>();
        initialHistory.add(0);
        quizScoreHistory.get(code).put(participantId, initialHistory);
        return Map.of("participantId", participantId, "quizCode", code);
    }

    public List<Question> getQuizQuestions(String code) {
        Quiz quiz = ensureQuizExists(code);
        return quiz.questionIds().stream()
                .map(questionBST::search)
                .filter(q -> q != null)
                .toList();
    }

    public Map<String, Object> submitAnswers(String code, String participantId, Map<Long, Integer> answers) {
        Quiz quiz = ensureQuizExists(code);
        if (!quizScores.get(code).containsKey(participantId)) {
            throw new IllegalArgumentException("Participant has not joined this quiz");
        }
        int score = 0;
        for (Long questionId : quiz.questionIds()) {
            Question question = questionBST.search(questionId);
            Integer selectedOption = answers.get(questionId);
            if (question != null && selectedOption != null && selectedOption == question.correctOption()) {
                score += question.difficulty() * POINTS_PER_DIFFICULTY_LEVEL;
            }
        }
        quizScores.get(code).put(participantId, score);
        quizScoreHistory.get(code).get(participantId).add(score);

        return Map.of(
                "participantId", participantId,
                "score", score,
                "complexity", "BST search O(h) per question"
        );
    }

    public List<LeaderboardEntry> leaderboard(String code) {
        ensureQuizExists(code);
        MaxHeap heap = new MaxHeap();
        for (Map.Entry<String, Integer> entry : quizScores.get(code).entrySet()) {
            heap.insert(new LeaderboardEntry(entry.getKey(), participantNames.getOrDefault(entry.getKey(), "Unknown"), entry.getValue()));
        }

        List<LeaderboardEntry> ranked = new ArrayList<>();
        while (!heap.isEmpty()) {
            ranked.add(heap.extractMax());
        }
        return ranked;
    }

    public Map<String, Object> analytics(String code, int left, int right, String participantId) {
        ensureQuizExists(code);
        int[] scores = leaderboard(code).stream().mapToInt(LeaderboardEntry::score).toArray();
        SegmentTree segmentTree = new SegmentTree(scores);
        int rangeSum = segmentTree.rangeQuery(left, right);
        List<Integer> history = quizScoreHistory.get(code).getOrDefault(participantId, List.of());
        int lis = DynamicProgrammingUtils.longestIncreasingSubsequence(history);

        return new LinkedHashMap<>(Map.of(
                "rangeScoreSum", rangeSum,
                "lisPerformanceTrend", lis,
                "complexity", Map.of(
                        "segmentTreeQuery", "O(log n)",
                        "lis", "O(n^2)"
                )
        ));
    }

    public List<String> recommendTopics(String topic, String mode) {
        return switch (mode.toLowerCase()) {
            case "dfs" -> topicGraph.dfs(topic);
            case "topo" -> topicGraph.topologicalSort();
            default -> topicGraph.bfs(topic);
        };
    }

    public Map<String, Object> optimizeQuiz(String code, int maxWeight) {
        List<Question> selected = DynamicProgrammingUtils.knapsackSelect(getQuizQuestions(code), maxWeight);
        return Map.of(
                "selectedQuestions", selected,
                "complexity", "Knapsack DP O(n × W)"
        );
    }

    public List<Question> allQuestionsInOrder() {
        return questionBST.inorderTraversal();
    }

    public void deleteQuestion(long id) {
        allQuestions.remove(id);
        questionBST.delete(id);
    }

    private Quiz ensureQuizExists(String code) {
        Quiz quiz = quizzes.get(code);
        if (quiz == null) {
            throw new IllegalArgumentException("Quiz not found: " + code);
        }
        return quiz;
    }

    private String generateQuizCode() {
        String code;
        do {
            String compactUuid = UUID.randomUUID().toString().replace("-", "");
            if (compactUuid.length() < QUIZ_CODE_LENGTH) {
                throw new IllegalStateException("Generated UUID is shorter than expected code length");
            }
            code = compactUuid.substring(0, QUIZ_CODE_LENGTH).toUpperCase();
        } while (quizzes.containsKey(code));
        return code;
    }

    public void seedQuestionsIfEmpty() {
        if (!allQuestions.isEmpty()) {
            return;
        }
        addQuestion(new Question(101, "What is time complexity of binary search?", List.of("O(n)", "O(log n)", "O(n log n)", "O(1)"), 1, "Binary Search", 2, 2));
        addQuestion(new Question(102, "Which traversal uses queue?", List.of("DFS", "BFS", "Inorder", "Postorder"), 1, "Graphs", 2, 2));
        addQuestion(new Question(103, "Topological sort applies to?", List.of("Undirected Graph", "DAG", "Tree", "Heap"), 1, "Topological Sort", 3, 3));
        addQuestion(new Question(104, "Segment tree query complexity?", List.of("O(n)", "O(log n)", "O(n^2)", "O(1)"), 1, "Segment Tree", 3, 2));
    }

    public Map<String, String> dsaComplexityMap() {
        return Map.of(
                "BST", "Insert/Search/Delete: O(h)",
                "Heap", "Insert/ExtractMax: O(log n)",
                "Graph", "BFS/DFS/Topo: O(V + E)",
                "Knapsack", "O(n × W)",
                "LIS", "O(n^2)",
                "SegmentTree", "Range Query: O(log n)"
        );
    }

    public synchronized Map<String, Object> createSession(String title, List<Long> questionIds, Integer questionDurationSeconds) {
        Quiz quiz = createQuiz(title, questionIds);
        String sessionId = "S" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        LiveSession session = new LiveSession(
                sessionId,
                quiz.code(),
                Math.max(5, questionDurationSeconds == null ? DEFAULT_QUESTION_DURATION_SECONDS : questionDurationSeconds)
        );
        sessions.put(sessionId, session);
        return Map.of(
                "sessionId", sessionId,
                "quizCode", quiz.code(),
                "state", session.state
        );
    }

    public synchronized Map<String, Object> joinSession(String sessionId, String participantName) {
        LiveSession session = ensureSessionExists(sessionId);
        if (!"LOBBY".equals(session.state)) {
            throw new IllegalStateException("Session already started");
        }
        String participantId = UUID.randomUUID().toString();
        participantNames.put(participantId, participantName);
        session.participants.put(participantId, participantName);
        session.scores.put(participantId, 0);
        List<Integer> initialHistory = new ArrayList<>();
        initialHistory.add(0);
        session.scoreHistory.put(participantId, initialHistory);
        return Map.of(
                "sessionId", sessionId,
                "participantId", participantId,
                "participantName", participantName,
                "state", session.state
        );
    }

    public synchronized Map<String, Object> getSessionQuestion(String sessionId, boolean start) {
        LiveSession session = ensureSessionExists(sessionId);
        if ("LOBBY".equals(session.state) && start) {
            session.state = "LIVE";
            session.startEpochMs = System.currentTimeMillis();
        }
        updateSessionState(session);

        if (!"LIVE".equals(session.state)) {
            return Map.of(
                    "sessionId", sessionId,
                    "state", session.state,
                    "players", session.participants.values(),
                    "playerCount", session.participants.size()
            );
        }

        List<Question> questions = getQuizQuestions(session.quizCode);
        int index = currentQuestionIndex(session);
        Question question = questions.get(index);
        int elapsedForQuestionSeconds = elapsedForQuestionSeconds(session);
        int remainingSeconds = Math.max(0, session.questionDurationSeconds - elapsedForQuestionSeconds);

        return Map.of(
                "sessionId", sessionId,
                "state", session.state,
                "questionIndex", index,
                "totalQuestions", questions.size(),
                "remainingSeconds", remainingSeconds,
                "question", Map.of(
                        "id", question.id(),
                        "text", question.text(),
                        "options", question.options(),
                        "topic", question.topic()
                )
        );
    }

    public synchronized Map<String, Object> submitSessionAnswer(String sessionId, String participantId, int answerOption) {
        LiveSession session = ensureSessionExists(sessionId);
        updateSessionState(session);
        if (!"LIVE".equals(session.state)) {
            throw new IllegalStateException("Session is not live");
        }
        if (!session.participants.containsKey(participantId)) {
            throw new IllegalArgumentException("Participant has not joined this session");
        }

        int index = currentQuestionIndex(session);
        String answerKey = participantId + ":" + index;
        if (session.submittedAnswers.contains(answerKey)) {
            return Map.of(
                    "participantId", participantId,
                    "questionIndex", index,
                    "alreadySubmitted", true
            );
        }
        session.submittedAnswers.add(answerKey);

        List<Question> questions = getQuizQuestions(session.quizCode);
        Question current = questions.get(index);
        boolean isCorrect = answerOption == current.correctOption();

        int existing = session.scores.getOrDefault(participantId, 0);
        int updated = existing;
        if (isCorrect) {
            updated += current.difficulty() * POINTS_PER_DIFFICULTY_LEVEL;
        }
        session.scores.put(participantId, updated);
        session.scoreHistory.get(participantId).add(updated);

        return Map.of(
                "participantId", participantId,
                "questionId", current.id(),
                "isCorrect", isCorrect,
                "correctOption", current.correctOption(),
                "score", updated
        );
    }

    public synchronized List<LeaderboardEntry> sessionLeaderboard(String sessionId) {
        LiveSession session = ensureSessionExists(sessionId);
        return heapRankedLeaderboard(session.scores, session.participants);
    }

    public synchronized Map<String, Object> sessionResults(String sessionId) {
        LiveSession session = ensureSessionExists(sessionId);
        updateSessionState(session);
        List<LeaderboardEntry> leaderboard = sessionLeaderboard(sessionId);
        int[] scores = leaderboard.stream().mapToInt(LeaderboardEntry::score).toArray();
        SegmentTree segmentTree = new SegmentTree(scores);
        int totalScoreRange = segmentTree.rangeQuery(0, Math.max(0, scores.length - 1));

        Map<String, Integer> lisByParticipant = new HashMap<>();
        for (Map.Entry<String, List<Integer>> entry : session.scoreHistory.entrySet()) {
            lisByParticipant.put(entry.getKey(), DynamicProgrammingUtils.longestIncreasingSubsequence(entry.getValue()));
        }

        return Map.of(
                "sessionId", sessionId,
                "state", session.state,
                "leaderboard", leaderboard,
                "totalScoreRange", totalScoreRange,
                "lisPerformanceTrend", lisByParticipant,
                "complexity", Map.of(
                        "heapLeaderboard", "O(n log n)",
                        "segmentTreeRange", "O(log n)",
                        "lis", "O(n^2)"
                )
        );
    }

    private List<LeaderboardEntry> heapRankedLeaderboard(Map<String, Integer> scores, Map<String, String> names) {
        MaxHeap heap = new MaxHeap();
        for (Map.Entry<String, Integer> entry : scores.entrySet()) {
            heap.insert(new LeaderboardEntry(entry.getKey(), names.getOrDefault(entry.getKey(), "Unknown"), entry.getValue()));
        }
        List<LeaderboardEntry> ranked = new ArrayList<>();
        while (!heap.isEmpty()) {
            ranked.add(heap.extractMax());
        }
        return ranked;
    }

    private void updateSessionState(LiveSession session) {
        if (!"LIVE".equals(session.state)) {
            return;
        }
        int totalQuestions = getQuizQuestions(session.quizCode).size();
        int elapsedSeconds = (int) ((System.currentTimeMillis() - session.startEpochMs) / 1000L);
        if (elapsedSeconds >= totalQuestions * session.questionDurationSeconds) {
            session.state = "COMPLETED";
        }
    }

    private int currentQuestionIndex(LiveSession session) {
        int elapsedSeconds = (int) ((System.currentTimeMillis() - session.startEpochMs) / 1000L);
        int index = elapsedSeconds / session.questionDurationSeconds;
        int maxIndex = Math.max(0, getQuizQuestions(session.quizCode).size() - 1);
        return Math.min(index, maxIndex);
    }

    private int elapsedForQuestionSeconds(LiveSession session) {
        int elapsedSeconds = (int) ((System.currentTimeMillis() - session.startEpochMs) / 1000L);
        return elapsedSeconds % session.questionDurationSeconds;
    }

    private LiveSession ensureSessionExists(String sessionId) {
        LiveSession session = sessions.get(sessionId);
        if (session == null) {
            throw new IllegalArgumentException("Session not found: " + sessionId);
        }
        return session;
    }

    private static class LiveSession {
        private final String sessionId;
        private final String quizCode;
        private final int questionDurationSeconds;
        private final Map<String, String> participants = new HashMap<>();
        private final Map<String, Integer> scores = new HashMap<>();
        private final Map<String, List<Integer>> scoreHistory = new HashMap<>();
        private final Set<String> submittedAnswers = new HashSet<>();
        private String state = "LOBBY";
        private long startEpochMs;

        private LiveSession(String sessionId, String quizCode, int questionDurationSeconds) {
            this.sessionId = sessionId;
            this.quizCode = quizCode;
            this.questionDurationSeconds = questionDurationSeconds;
        }
    }
}
