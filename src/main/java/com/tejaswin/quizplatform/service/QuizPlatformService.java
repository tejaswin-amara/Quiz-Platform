package com.tejaswin.quizplatform.service;

import com.tejaswin.quizplatform.dsa.DynamicProgrammingUtils;
import com.tejaswin.quizplatform.dsa.QuestionBST;
import com.tejaswin.quizplatform.dsa.TopicGraph;
import com.tejaswin.quizplatform.exception.NotFoundException;
import com.tejaswin.quizplatform.model.LeaderboardEntry;
import com.tejaswin.quizplatform.model.Question;
import com.tejaswin.quizplatform.model.Quiz;
import com.tejaswin.quizplatform.persistence.entity.QuestionEntity;
import com.tejaswin.quizplatform.persistence.entity.QuizEntity;
import com.tejaswin.quizplatform.persistence.entity.QuizResultEntity;
import com.tejaswin.quizplatform.persistence.repository.QuestionRepository;
import com.tejaswin.quizplatform.persistence.repository.QuizRepository;
import com.tejaswin.quizplatform.persistence.repository.QuizResultRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class QuizPlatformService {
    private static final int QUIZ_CODE_LENGTH = 6;
    private static final int POINTS_PER_DIFFICULTY_LEVEL = 10;

    private final QuestionBST questionBST = new QuestionBST();
    private final TopicGraph topicGraph = new TopicGraph();

    private final Map<Long, Question> allQuestions = new HashMap<>();
    private final Map<String, Quiz> quizzes = new HashMap<>();
    private final Map<String, Map<String, Integer>> quizScores = new HashMap<>();
    private final Map<String, Map<String, List<Integer>>> quizScoreHistory = new HashMap<>();
    private final Map<String, String> participantNames = new HashMap<>();

    private final QuestionRepository questionRepository;
    private final QuizRepository quizRepository;
    private final QuizResultRepository quizResultRepository;
    private final LeaderboardService leaderboardService;
    private final AnalyticsService analyticsService;

    public QuizPlatformService(
            QuestionRepository questionRepository,
            QuizRepository quizRepository,
            QuizResultRepository quizResultRepository,
            LeaderboardService leaderboardService,
            AnalyticsService analyticsService
    ) {
        this.questionRepository = questionRepository;
        this.quizRepository = quizRepository;
        this.quizResultRepository = quizResultRepository;
        this.leaderboardService = leaderboardService;
        this.analyticsService = analyticsService;

        topicGraph.addEdge("Arrays", "Sliding Window");
        topicGraph.addEdge("Sliding Window", "Two Pointers");
        topicGraph.addEdge("Two Pointers", "Binary Search");
        topicGraph.addEdge("Binary Search", "Dynamic Programming");
        topicGraph.addEdge("Graphs", "Topological Sort");
        topicGraph.addEdge("Topological Sort", "Shortest Path");
    }

    @PostConstruct
    @Transactional
    void loadPersistedData() {
        for (QuestionEntity entity : questionRepository.findAll()) {
            Question question = mapQuestion(entity);
            allQuestions.put(question.id(), question);
            questionBST.insert(question);
            topicGraph.addTopic(question.topic());
        }

        for (QuizEntity entity : quizRepository.findAll()) {
            Quiz quiz = new Quiz(entity.getCode(), entity.getTitle(), parseQuestionIds(entity.getQuestionIdsCsv()));
            quizzes.put(quiz.code(), quiz);
            quizScores.putIfAbsent(quiz.code(), new HashMap<>());
            quizScoreHistory.putIfAbsent(quiz.code(), new HashMap<>());
        }
    }

    @Transactional
    public synchronized Question addQuestion(Question question) {
        validateQuestion(question);
        allQuestions.put(question.id(), question);
        questionBST.insert(question);
        topicGraph.addTopic(question.topic());
        questionRepository.save(mapEntity(question));
        return question;
    }

    @Transactional
    public synchronized Quiz createQuiz(String title, List<Long> questionIds) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Quiz title is required");
        }
        if (questionIds == null || questionIds.isEmpty()) {
            throw new IllegalArgumentException("At least one question ID is required");
        }

        for (Long questionId : questionIds) {
            if (questionId == null || resolveQuestion(questionId) == null) {
                throw new IllegalArgumentException("Question not found in BST: " + questionId);
            }
        }

        String code = generateQuizCode();
        Quiz quiz = new Quiz(code, title.trim(), questionIds);
        quizzes.put(code, quiz);
        quizScores.put(code, new HashMap<>());
        quizScoreHistory.put(code, new HashMap<>());

        QuizEntity entity = new QuizEntity();
        entity.setCode(quiz.code());
        entity.setTitle(quiz.title());
        entity.setQuestionIdsCsv(toCsv(quiz.questionIds()));
        quizRepository.save(entity);

        return quiz;
    }

    @Transactional
    public synchronized Map<String, String> joinQuiz(String code, String participantName) {
        ensureQuizExists(code);
        if (participantName == null || participantName.isBlank()) {
            throw new IllegalArgumentException("Participant name is required");
        }

        String participantId = UUID.randomUUID().toString();
        participantNames.put(participantId, participantName.trim());
        quizScores.get(code).put(participantId, 0);
        quizScoreHistory.get(code).put(participantId, new ArrayList<>(List.of(0)));
        return Map.of("participantId", participantId, "quizCode", code);
    }

    public synchronized List<Question> getQuizQuestions(String code) {
        Quiz quiz = ensureQuizExists(code);
        return quiz.questionIds().stream()
                .map(this::resolveQuestion)
                .filter(q -> q != null)
                .toList();
    }

    @Transactional
    public synchronized Map<String, Object> submitAnswers(String code, String participantId, Map<Long, Integer> answers) {
        Quiz quiz = ensureQuizExists(code);
        if (participantId == null || participantId.isBlank()) {
            throw new IllegalArgumentException("participantId is required");
        }
        if (answers == null || answers.isEmpty()) {
            throw new IllegalArgumentException("Answers payload cannot be empty");
        }
        if (!quizScores.get(code).containsKey(participantId)) {
            throw new IllegalArgumentException("Participant has not joined this quiz");
        }

        int score = 0;
        Map<Integer, Integer> difficultyImpact = new HashMap<>();
        for (Long questionId : quiz.questionIds()) {
            Question question = questionBST.search(questionId);
            Integer selectedOption = answers.get(questionId);
            if (question != null && selectedOption != null && selectedOption == question.correctOption()) {
                int delta = question.difficulty() * POINTS_PER_DIFFICULTY_LEVEL;
                score += delta;
                difficultyImpact.merge(question.difficulty(), delta, Integer::sum);
            }
        }

        quizScores.get(code).put(participantId, score);
        quizScoreHistory.get(code).get(participantId).add(score);

        QuizResultEntity resultEntity = new QuizResultEntity();
        resultEntity.setQuizCode(code);
        resultEntity.setParticipantId(participantId);
        resultEntity.setParticipantName(participantNames.getOrDefault(participantId, "Unknown"));
        resultEntity.setScore(score);
        resultEntity.setSubmittedAt(Instant.now());
        quizResultRepository.save(resultEntity);

        return new LinkedHashMap<>(Map.of(
                "participantId", participantId,
                "score", score,
                "difficultyImpact", difficultyImpact,
                "complexity", "BST search O(h) per question"
        ));
    }

    public synchronized List<LeaderboardEntry> leaderboard(String code) {
        ensureQuizExists(code);
        return leaderboardService.rank(quizScores.get(code), participantNames);
    }

    public synchronized Map<String, Object> analytics(String code, int left, int right, String participantId) {
        ensureQuizExists(code);
        List<Integer> history = quizScoreHistory.get(code).getOrDefault(participantId, List.of());
        return analyticsService.quizAnalytics(leaderboard(code), history, left, right);
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

    @Transactional
    public synchronized void deleteQuestion(long id) {
        allQuestions.remove(id);
        questionBST.delete(id);
        questionRepository.deleteById(id);
    }

    public synchronized Quiz ensureQuizExists(String code) {
        Quiz quiz = quizzes.get(code);
        if (quiz != null) {
            return quiz;
        }
        return quizRepository.findById(code)
                .map(entity -> {
                    Quiz loaded = new Quiz(entity.getCode(), entity.getTitle(), parseQuestionIds(entity.getQuestionIdsCsv()));
                    quizzes.put(loaded.code(), loaded);
                    quizScores.putIfAbsent(loaded.code(), new HashMap<>());
                    quizScoreHistory.putIfAbsent(loaded.code(), new HashMap<>());
                    return loaded;
                })
                .orElseThrow(() -> new NotFoundException("Quiz not found: " + code));
    }

    public synchronized String resolveParticipantName(String participantId) {
        return participantNames.getOrDefault(participantId, "Unknown");
    }

    private String generateQuizCode() {
        String code;
        do {
            String compactUuid = UUID.randomUUID().toString().replace("-", "");
            if (compactUuid.length() < QUIZ_CODE_LENGTH) {
                throw new IllegalStateException("Generated UUID is shorter than expected code length");
            }
            code = compactUuid.substring(0, QUIZ_CODE_LENGTH).toUpperCase();
        } while (quizzes.containsKey(code) || quizRepository.existsById(code));
        return code;
    }

    public synchronized void seedQuestionsIfEmpty() {
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

    public Map<String, Object> dsaInsights() {
        return new LinkedHashMap<>(Map.of(
                "questionFlow", "BST retrieves each question by ID during quiz and live sessions (avg O(log n)).",
                "leaderboardFlow", "Max Heap ranks participants on every leaderboard fetch (O(n log n)).",
                "recommendationFlow", "Graph BFS/DFS/Topo powers topic progression and recommendations (O(V + E)).",
                "optimizationFlow", "Knapsack DP selects best weighted question subset (O(n × W)).",
                "analyticsFlow", "Segment Tree answers score range queries while LIS tracks trend over attempts.",
                "workingDiagram", List.of(
                        "Question Request -> BST.search(id) -> Question Returned",
                        "Answer Submit -> Score Update -> Heap Rebuild -> Leaderboard Sorted",
                        "Results Request -> SegmentTree.rangeQuery + DP.LIS -> Analytics Output"
                ),
                "runtimeSignals", List.of(
                        "BST lookup -> question payload ready",
                        "Heap updated -> leaderboard recalculated",
                        "Segment Tree queried -> score range refreshed",
                        "DP LIS computed -> trend value refreshed"
                )
        ));
    }

    public synchronized boolean questionExists(long id) {
        return allQuestions.containsKey(id);
    }

    private void validateQuestion(Question question) {
        if (question == null) {
            throw new IllegalArgumentException("Question payload is required");
        }
        if (question.text() == null || question.text().isBlank()) {
            throw new IllegalArgumentException("Question text is required");
        }
        if (question.options() == null || question.options().size() < 2) {
            throw new IllegalArgumentException("At least two options are required");
        }
        if (question.correctOption() < 0 || question.correctOption() >= question.options().size()) {
            throw new IllegalArgumentException("correctOption is out of bounds");
        }
    }

    private QuestionEntity mapEntity(Question question) {
        QuestionEntity entity = new QuestionEntity();
        entity.setId(question.id());
        entity.setText(question.text());
        entity.setOptionsSerialized(String.join("|||", question.options()));
        entity.setCorrectOption(question.correctOption());
        entity.setTopic(question.topic());
        entity.setDifficulty(question.difficulty());
        entity.setWeight(question.weight());
        return entity;
    }

    private Question mapQuestion(QuestionEntity entity) {
        List<String> options = List.of(entity.getOptionsSerialized().split("\\|\\|\\|"));
        return new Question(
                entity.getId(),
                entity.getText(),
                options,
                entity.getCorrectOption(),
                entity.getTopic(),
                entity.getDifficulty(),
                entity.getWeight()
        );
    }

    private Question resolveQuestion(Long questionId) {
        Question cached = questionBST.search(questionId);
        if (cached != null) {
            return cached;
        }
        return questionRepository.findById(questionId)
                .map(this::mapQuestion)
                .map(question -> {
                    allQuestions.put(question.id(), question);
                    questionBST.insert(question);
                    topicGraph.addTopic(question.topic());
                    return question;
                })
                .orElse(null);
    }

    private String toCsv(List<Long> values) {
        return values.stream().map(String::valueOf).collect(Collectors.joining(","));
    }

    private List<Long> parseQuestionIds(String csv) {
        if (csv == null || csv.isBlank()) {
            return List.of();
        }
        List<Long> ids = new ArrayList<>();
        for (String token : csv.split(",")) {
            ids.add(Long.parseLong(token.trim()));
        }
        return ids;
    }
}
