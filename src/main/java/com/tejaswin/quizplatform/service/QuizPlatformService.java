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
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class QuizPlatformService {
    private final QuestionBST questionBST = new QuestionBST();
    private final TopicGraph topicGraph = new TopicGraph();
    private final Map<Long, Question> allQuestions = new HashMap<>();
    private final Map<String, Quiz> quizzes = new HashMap<>();
    private final Map<String, Map<String, Integer>> quizScores = new HashMap<>();
    private final Map<String, Map<String, List<Integer>>> quizScoreHistory = new HashMap<>();
    private final Map<String, String> participantNames = new HashMap<>();

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
        String code = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
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
        quizScoreHistory.get(code).put(participantId, new ArrayList<>(List.of(0)));
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
                score += question.difficulty() * 10;
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
}
