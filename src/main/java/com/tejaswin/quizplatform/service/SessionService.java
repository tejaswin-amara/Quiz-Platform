package com.tejaswin.quizplatform.service;

import com.tejaswin.quizplatform.exception.NotFoundException;
import com.tejaswin.quizplatform.model.LeaderboardEntry;
import com.tejaswin.quizplatform.model.Question;
import com.tejaswin.quizplatform.model.Quiz;
import com.tejaswin.quizplatform.persistence.entity.PlayerEntity;
import com.tejaswin.quizplatform.persistence.entity.ResultEntity;
import com.tejaswin.quizplatform.persistence.entity.SessionEntity;
import com.tejaswin.quizplatform.persistence.repository.PlayerRepository;
import com.tejaswin.quizplatform.persistence.repository.ResultRepository;
import com.tejaswin.quizplatform.persistence.repository.SessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.AccessDeniedException;
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
public class SessionService {
    private static final Logger log = LoggerFactory.getLogger(SessionService.class);
    private static final int POINTS_PER_DIFFICULTY_LEVEL = 10;
    private static final long TOUCH_PERSIST_THROTTLE_MS = 5000L;

    private final QuizPlatformService quizPlatformService;
    private final LeaderboardService leaderboardService;
    private final AnalyticsService analyticsService;
    private final SessionRepository sessionRepository;
    private final PlayerRepository playerRepository;
    private final ResultRepository resultRepository;
    private final int defaultQuestionDurationSeconds;
    private final int expiryMinutes;
    private static final List<Long> DEMO_QUESTION_IDS = List.of(9101L, 9102L, 9103L, 9104L, 9105L, 9106L, 9107L, 9108L);
    private static final List<String> DEMO_PLAYERS = List.of("Ava", "Liam", "Noah", "Mia");

    public SessionService(
            QuizPlatformService quizPlatformService,
            LeaderboardService leaderboardService,
            AnalyticsService analyticsService,
            SessionRepository sessionRepository,
            PlayerRepository playerRepository,
            ResultRepository resultRepository,
            @Value("${quiz.session.default-question-duration-seconds:15}") int defaultQuestionDurationSeconds,
            @Value("${quiz.session.expiry-minutes:45}") int expiryMinutes
    ) {
        this.quizPlatformService = quizPlatformService;
        this.leaderboardService = leaderboardService;
        this.analyticsService = analyticsService;
        this.sessionRepository = sessionRepository;
        this.playerRepository = playerRepository;
        this.resultRepository = resultRepository;
        this.defaultQuestionDurationSeconds = defaultQuestionDurationSeconds;
        this.expiryMinutes = expiryMinutes;
    }

    @Transactional
    public Map<String, Object> createSession(Long hostUserId, String title, List<Long> questionIds, Integer questionDurationSeconds) {
        if (hostUserId == null) {
            throw new IllegalArgumentException("Authenticated host user is required");
        }
        Quiz quiz = quizPlatformService.createQuiz(title, questionIds);
        String sessionId = "S" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();

        long now = System.currentTimeMillis();
        SessionEntity session = new SessionEntity();
        session.setSessionId(sessionId);
        session.setQuizCode(quiz.code());
        session.setHostUserId(hostUserId);
        session.setState("LOBBY");
        session.setQuestionDurationSeconds(Math.max(5, questionDurationSeconds == null ? defaultQuestionDurationSeconds : questionDurationSeconds));
        session.setStartEpochMs(null);
        session.setPausedAtEpochMs(null);
        session.setForcedQuestionIndex(null);
        session.setLastPersistedTouchEpochMs(now);
        session.setLastActivityEpochMs(now);
        sessionRepository.save(session);

        log.info("event=session_created sessionId={} quizCode={} hostUserId={} durationSec={}", sessionId, quiz.code(), hostUserId, session.getQuestionDurationSeconds());

        return Map.of(
                "sessionId", sessionId,
                "quizCode", quiz.code(),
                "state", session.getState()
        );
    }

    @Transactional
    public Map<String, Object> startDemoSession(Long hostUserId) {
        ensureDemoQuestions();
        Map<String, Object> created = createSession(hostUserId, "Demo DSA Quiz", DEMO_QUESTION_IDS, 10);
        String sessionId = String.valueOf(created.get("sessionId"));

        List<Map<String, Object>> joinedPlayers = new ArrayList<>();
        for (String name : DEMO_PLAYERS) {
            joinedPlayers.add(joinSession(sessionId, name, null));
        }

        return new LinkedHashMap<>(Map.of(
                "sessionId", sessionId,
                "quizCode", created.get("quizCode"),
                "state", created.get("state"),
                "playerCount", joinedPlayers.size(),
                "players", joinedPlayers.stream().map(entry -> String.valueOf(entry.get("participantName"))).toList(),
                "message", "Demo session ready. Start quiz from lobby."
        ));
    }

    @Transactional
    public Map<String, Object> joinSession(String sessionId, String participantName, Long userId) {
        SessionEntity session = ensureSessionExists(sessionId);
        if (!"LOBBY".equals(session.getState())) {
            throw new IllegalStateException("Session is not accepting joins");
        }
        if (participantName == null || participantName.isBlank()) {
            throw new IllegalArgumentException("participantName is required");
        }
        String normalizedName = participantName.trim();
        if (playerRepository.existsBySessionIdAndParticipantNameIgnoreCase(sessionId, normalizedName)) {
            throw new IllegalArgumentException("Participant with this name already joined");
        }

        String participantId = UUID.randomUUID().toString();
        PlayerEntity player = new PlayerEntity();
        player.setParticipantId(participantId);
        player.setSessionId(sessionId);
        player.setUserId(userId);
        player.setParticipantName(normalizedName);
        player.setScore(0);
        player.setScoreHistoryCsv("0");
        playerRepository.save(player);

        touchSession(session, true);
        log.info("event=session_joined sessionId={} participantId={} participantName={} userId={}", sessionId, participantId, normalizedName, userId);

        return Map.of(
                "sessionId", sessionId,
                "participantId", participantId,
                "participantName", normalizedName,
                "state", session.getState()
        );
    }

    @Transactional
    public Map<String, Object> getSessionQuestion(String sessionId, boolean start, Long callerUserId) {
        SessionEntity session = ensureSessionExists(sessionId);

        if ("LOBBY".equals(session.getState()) && start) {
            requireHostOwner(session, callerUserId);
            if (playerRepository.countBySessionId(sessionId) == 0) {
                throw new IllegalStateException("Cannot start without participants");
            }
            session.setState("LIVE");
            long now = System.currentTimeMillis();
            session.setStartEpochMs(now);
            session.setPausedAtEpochMs(null);
            session.setForcedQuestionIndex(0L);
            sessionRepository.save(session);
            log.info("event=session_started sessionId={} participants={}", sessionId, playerRepository.countBySessionId(sessionId));
        }

        updateSessionState(session);
        touchSession(session, false);

        if (!"LIVE".equals(session.getState())) {
            List<String> players = playerRepository.findBySessionId(sessionId).stream()
                    .map(PlayerEntity::getParticipantName)
                    .toList();
            return Map.of(
                    "sessionId", sessionId,
                    "state", session.getState(),
                    "players", players,
                    "playerCount", players.size()
            );
        }

        List<Question> questions = quizPlatformService.getQuizQuestions(session.getQuizCode());
        if (questions.isEmpty()) {
            throw new IllegalStateException("Session has no valid questions");
        }

        int index = currentQuestionIndex(session, questions.size());
        Question question = questions.get(index);
        int elapsedForQuestionSeconds = elapsedForQuestionSeconds(session);
        int remainingSeconds = Math.max(0, session.getQuestionDurationSeconds() - elapsedForQuestionSeconds);

        return Map.of(
                "sessionId", sessionId,
                "state", session.getState(),
                "questionIndex", index,
                "totalQuestions", questions.size(),
                "remainingSeconds", remainingSeconds,
                "questionDurationSeconds", session.getQuestionDurationSeconds(),
                "question", Map.of(
                        "id", question.id(),
                        "text", question.text(),
                        "options", question.options(),
                        "topic", question.topic()
                )
        );
    }

    @Transactional
    public Map<String, Object> submitSessionAnswer(String sessionId, String participantId, int answerOption, Long callerUserId) {
        if (participantId == null || participantId.isBlank()) {
            throw new IllegalArgumentException("participantId is required");
        }
        SessionEntity session = ensureSessionExists(sessionId);
        updateSessionState(session);
        if (!"LIVE".equals(session.getState())) {
            throw new IllegalStateException("Session is not live");
        }

        PlayerEntity player = playerRepository.findByParticipantIdAndSessionId(participantId, sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Participant has not joined this session"));
        if (player.getUserId() != null && !player.getUserId().equals(callerUserId)) {
            throw new AccessDeniedException("Cannot submit answers for another participant");
        }

        List<Question> questions = quizPlatformService.getQuizQuestions(session.getQuizCode());
        int index = currentQuestionIndex(session, questions.size());
        if (resultRepository.existsBySessionIdAndParticipantIdAndQuestionIndex(sessionId, participantId, index)) {
            return Map.of(
                    "participantId", participantId,
                    "questionIndex", index,
                    "alreadySubmitted", true
            );
        }

        Question current = questions.get(index);
        if (answerOption < 0 || answerOption >= current.options().size()) {
            throw new IllegalArgumentException("answerOption out of bounds");
        }

        boolean isCorrect = answerOption == current.correctOption();
        int updated = player.getScore();
        if (isCorrect) {
            updated += current.difficulty() * POINTS_PER_DIFFICULTY_LEVEL;
        }
        player.setScore(updated);

        List<Integer> history = parseHistory(player.getScoreHistoryCsv());
        history.add(updated);
        player.setScoreHistoryCsv(toHistoryCsv(history));
        playerRepository.save(player);

        ResultEntity result = new ResultEntity();
        result.setSessionId(sessionId);
        result.setParticipantId(participantId);
        result.setQuestionIndex(index);
        result.setQuestionId(current.id());
        result.setCorrect(isCorrect);
        result.setScoreAfterAnswer(updated);
        result.setSubmittedAt(Instant.now());
        resultRepository.save(result);

        touchSession(session, false);
        log.info(
                "event=session_answer_submitted sessionId={} participantId={} questionId={} correct={} score={}",
                sessionId,
                participantId,
                current.id(),
                isCorrect,
                updated
        );

        return Map.of(
                "participantId", participantId,
                "questionId", current.id(),
                "isCorrect", isCorrect,
                "correctOption", current.correctOption(),
                "score", updated
        );
    }

    @Transactional(readOnly = true)
    public List<LeaderboardEntry> sessionLeaderboard(String sessionId) {
        SessionEntity session = ensureSessionExists(sessionId);

        List<PlayerEntity> players = playerRepository.findBySessionId(sessionId);
        Map<String, Integer> scores = new HashMap<>();
        Map<String, String> names = new HashMap<>();
        for (PlayerEntity player : players) {
            scores.put(player.getParticipantId(), player.getScore());
            names.put(player.getParticipantId(), player.getParticipantName());
        }

        List<LeaderboardEntry> ranked = leaderboardService.rank(scores, names);
        log.info("event=session_leaderboard_updated sessionId={} leaderboardSize={}", session.getSessionId(), ranked.size());
        return ranked;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> sessionResults(String sessionId) {
        SessionEntity session = ensureSessionExists(sessionId);

        List<LeaderboardEntry> leaderboard = sessionLeaderboard(sessionId);
        int totalScoreRange = analyticsService.totalScoreRange(leaderboard);

        Map<String, Integer> lisByParticipant = new HashMap<>();
        Map<String, Integer> rankByParticipant = new HashMap<>();

        int totalScore = 0;
        for (int i = 0; i < leaderboard.size(); i++) {
            LeaderboardEntry entry = leaderboard.get(i);
            totalScore += entry.score();
            rankByParticipant.put(entry.participantId(), i + 1);
        }
        double averageScore = leaderboard.isEmpty() ? 0.0 : (double) totalScore / leaderboard.size();

        for (PlayerEntity player : playerRepository.findBySessionId(sessionId)) {
            lisByParticipant.put(player.getParticipantId(), analyticsService.lisTrend(parseHistory(player.getScoreHistoryCsv())));
        }

        Map<Long, Question> questionById = quizPlatformService.getQuizQuestions(session.getQuizCode()).stream()
                .collect(Collectors.toMap(Question::id, question -> question));
        Map<Integer, Integer> difficultyBreakdown = new HashMap<>();
        for (ResultEntity result : resultRepository.findBySessionId(sessionId)) {
            if (Boolean.TRUE.equals(result.getCorrect())) {
                Question question = questionById.get(result.getQuestionId());
                if (question != null) {
                    int delta = question.difficulty() * POINTS_PER_DIFFICULTY_LEVEL;
                    difficultyBreakdown.merge(question.difficulty(), delta, Integer::sum);
                }
            }
        }

        return new LinkedHashMap<>(Map.of(
                "sessionId", sessionId,
                "state", session.getState(),
                "leaderboard", leaderboard,
                "totalScoreRange", totalScoreRange,
                "averageScore", averageScore,
                "difficultyImpact", difficultyBreakdown,
                "difficultyScoreBreakdown", difficultyBreakdown,
                "lisPerformanceTrend", lisByParticipant,
                "rankByParticipant", rankByParticipant,
                "complexity", Map.of(
                        "heapLeaderboard", "O(n log n)",
                        "segmentTreeRange", "O(log n)",
                        "lis", "O(n^2)"
                )
        ));
    }

    @Transactional
    public Map<String, Object> pauseSession(String sessionId, Long callerUserId) {
        SessionEntity session = ensureSessionExists(sessionId);
        requireHostOwner(session, callerUserId);
        if (!"LIVE".equals(session.getState())) {
            throw new IllegalStateException("Only LIVE sessions can be paused");
        }
        session.setState("PAUSED");
        session.setPausedAtEpochMs(System.currentTimeMillis());
        touchSession(session, true);
        return Map.of("sessionId", sessionId, "state", session.getState());
    }

    @Transactional
    public Map<String, Object> resumeSession(String sessionId, Long callerUserId) {
        SessionEntity session = ensureSessionExists(sessionId);
        requireHostOwner(session, callerUserId);
        if (!"PAUSED".equals(session.getState())) {
            throw new IllegalStateException("Only PAUSED sessions can be resumed");
        }
        long now = System.currentTimeMillis();
        if (session.getPausedAtEpochMs() != null && session.getStartEpochMs() != null) {
            long pausedDuration = now - session.getPausedAtEpochMs();
            session.setStartEpochMs(session.getStartEpochMs() + pausedDuration);
        }
        session.setPausedAtEpochMs(null);
        session.setState("LIVE");
        touchSession(session, true);
        return Map.of("sessionId", sessionId, "state", session.getState());
    }

    @Transactional
    public Map<String, Object> endSession(String sessionId, Long callerUserId) {
        SessionEntity session = ensureSessionExists(sessionId);
        requireHostOwner(session, callerUserId);
        session.setState("COMPLETED");
        touchSession(session, true);
        return Map.of("sessionId", sessionId, "state", session.getState());
    }

    @Transactional
    public Map<String, Object> closeLobby(String sessionId, Long callerUserId) {
        SessionEntity session = ensureSessionExists(sessionId);
        requireHostOwner(session, callerUserId);
        if (!"LOBBY".equals(session.getState())) {
            throw new IllegalStateException("Lobby can only be closed before start");
        }
        session.setState("COMPLETED");
        touchSession(session, true);
        return Map.of("sessionId", sessionId, "state", session.getState());
    }

    @Transactional
    public Map<String, Object> forceNextQuestion(String sessionId, Long callerUserId) {
        SessionEntity session = ensureSessionExists(sessionId);
        requireHostOwner(session, callerUserId);
        if (!"LIVE".equals(session.getState())) {
            throw new IllegalStateException("Session must be LIVE to force next question");
        }
        List<Question> questions = quizPlatformService.getQuizQuestions(session.getQuizCode());
        int currentIndex = currentQuestionIndex(session, questions.size());
        int nextIndex = Math.min(currentIndex + 1, Math.max(0, questions.size() - 1));
        session.setForcedQuestionIndex((long) nextIndex);
        session.setStartEpochMs(System.currentTimeMillis() - ((long) nextIndex * session.getQuestionDurationSeconds() * 1000L));
        touchSession(session, true);
        return Map.of("sessionId", sessionId, "forcedQuestionIndex", nextIndex, "state", session.getState());
    }

    @Transactional
    public Map<String, Object> removeParticipant(String sessionId, String participantKey, Long callerUserId) {
        SessionEntity session = ensureSessionExists(sessionId);
        requireHostOwner(session, callerUserId);

        PlayerEntity player = playerRepository.findByParticipantIdAndSessionId(participantKey, sessionId)
                .or(() -> playerRepository.findBySessionIdAndParticipantNameIgnoreCase(sessionId, participantKey))
                .orElseThrow(() -> new NotFoundException("Participant not found in session"));

        resultRepository.deleteBySessionIdAndParticipantId(sessionId, player.getParticipantId());
        playerRepository.deleteByParticipantIdAndSessionId(player.getParticipantId(), sessionId);
        touchSession(session, true);

        return Map.of(
                "sessionId", sessionId,
                "removedParticipantId", player.getParticipantId(),
                "removedParticipantName", player.getParticipantName(),
                "state", session.getState()
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Object> reviewAnswers(String sessionId, int questionIndex, Long callerUserId) {
        SessionEntity session = ensureSessionExists(sessionId);
        requireHostOwner(session, callerUserId);

        List<Map<String, Object>> answers = resultRepository.findBySessionIdAndQuestionIndex(sessionId, questionIndex).stream()
                .map(result -> Map.<String, Object>of(
                        "participantId", result.getParticipantId(),
                        "questionId", result.getQuestionId(),
                        "correct", result.getCorrect(),
                        "scoreAfterAnswer", result.getScoreAfterAnswer(),
                        "submittedAt", result.getSubmittedAt()
                ))
                .toList();

        return Map.of(
                "sessionId", sessionId,
                "questionIndex", questionIndex,
                "answers", answers
        );
    }

    @Scheduled(fixedDelayString = "${quiz.session.cleanup-interval-ms:60000}")
    @Transactional
    public void cleanupExpiredSessions() {
        long now = System.currentTimeMillis();
        long expiryMillis = expiryMinutes * 60_000L;
        List<SessionEntity> expired = sessionRepository.findByLastActivityEpochMsLessThan(now - expiryMillis);
        for (SessionEntity session : expired) {
            playerRepository.deleteBySessionId(session.getSessionId());
            resultRepository.deleteBySessionId(session.getSessionId());
            sessionRepository.delete(session);
        }
        if (!expired.isEmpty()) {
            log.info("event=session_cleanup removed={} remaining={}", expired.size(), sessionRepository.count());
        }
    }

    private void updateSessionState(SessionEntity session) {
        if (!"LIVE".equals(session.getState())) {
            return;
        }
        List<Question> questions = quizPlatformService.getQuizQuestions(session.getQuizCode());
        int elapsedSeconds = (int) ((System.currentTimeMillis() - safeStartEpoch(session)) / 1000L);
        if (elapsedSeconds >= questions.size() * session.getQuestionDurationSeconds()) {
            session.setState("COMPLETED");
            sessionRepository.save(session);
        }
    }

    private int currentQuestionIndex(SessionEntity session, int totalQuestions) {
        if (session.getForcedQuestionIndex() != null) {
            int forced = session.getForcedQuestionIndex().intValue();
            int maxIndex = Math.max(0, totalQuestions - 1);
            return Math.max(0, Math.min(forced, maxIndex));
        }
        int elapsedSeconds = (int) ((System.currentTimeMillis() - safeStartEpoch(session)) / 1000L);
        int index = elapsedSeconds / session.getQuestionDurationSeconds();
        int maxIndex = Math.max(0, totalQuestions - 1);
        return Math.min(index, maxIndex);
    }

    private int elapsedForQuestionSeconds(SessionEntity session) {
        int elapsedSeconds = (int) ((System.currentTimeMillis() - safeStartEpoch(session)) / 1000L);
        return elapsedSeconds % session.getQuestionDurationSeconds();
    }

    private long safeStartEpoch(SessionEntity session) {
        return session.getStartEpochMs() == null ? System.currentTimeMillis() : session.getStartEpochMs();
    }

    private void touchSession(SessionEntity session, boolean forcePersist) {
        long now = System.currentTimeMillis();
        session.setLastActivityEpochMs(now);
        if (forcePersist || session.getLastPersistedTouchEpochMs() == null || (now - session.getLastPersistedTouchEpochMs()) >= TOUCH_PERSIST_THROTTLE_MS) {
            session.setLastPersistedTouchEpochMs(now);
            sessionRepository.save(session);
        }
    }

    private SessionEntity ensureSessionExists(String sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new NotFoundException("Session not found: " + sessionId));
    }

    private void requireHostOwner(SessionEntity session, Long callerUserId) {
        if (callerUserId == null || !callerUserId.equals(session.getHostUserId())) {
            throw new IllegalStateException("Only session host can perform this operation");
        }
    }

    private List<Integer> parseHistory(String csv) {
        if (csv == null || csv.isBlank()) {
            return new ArrayList<>(List.of(0));
        }
        List<Integer> history = new ArrayList<>();
        for (String token : csv.split(",")) {
            history.add(Integer.parseInt(token.trim()));
        }
        if (history.isEmpty()) {
            history.add(0);
        }
        return history;
    }

    private String toHistoryCsv(List<Integer> history) {
        return history.stream().map(String::valueOf).collect(Collectors.joining(","));
    }

    private void ensureDemoQuestions() {
        if (!quizPlatformService.questionExists(9101L)) {
            quizPlatformService.addQuestion(new Question(9101L, "BST search average complexity?", List.of("O(n)", "O(log n)", "O(1)", "O(n log n)"), 1, "Binary Search", 2, 2));
        }
        if (!quizPlatformService.questionExists(9102L)) {
            quizPlatformService.addQuestion(new Question(9102L, "Heap is best for?", List.of("Range sum", "Stable sorting", "Priority retrieval", "Graph traversal"), 2, "Heap", 2, 2));
        }
        if (!quizPlatformService.questionExists(9103L)) {
            quizPlatformService.addQuestion(new Question(9103L, "BFS uses which DS?", List.of("Stack", "Queue", "Heap", "Tree"), 1, "Graphs", 2, 2));
        }
        if (!quizPlatformService.questionExists(9104L)) {
            quizPlatformService.addQuestion(new Question(9104L, "Topological sort works on?", List.of("DAG", "Any tree", "Undirected graph", "Heap"), 0, "Topological Sort", 3, 3));
        }
        if (!quizPlatformService.questionExists(9105L)) {
            quizPlatformService.addQuestion(new Question(9105L, "Knapsack is solved with?", List.of("Greedy always", "Divide and conquer", "Dynamic programming", "BFS"), 2, "Dynamic Programming", 3, 3));
        }
        if (!quizPlatformService.questionExists(9106L)) {
            quizPlatformService.addQuestion(new Question(9106L, "LIS complexity in this project?", List.of("O(log n)", "O(n)", "O(n^2)", "O(n^3)"), 2, "Dynamic Programming", 2, 2));
        }
        if (!quizPlatformService.questionExists(9107L)) {
            quizPlatformService.addQuestion(new Question(9107L, "Segment Tree range query?", List.of("O(log n)", "O(1)", "O(n)", "O(n log n)"), 0, "Segment Tree", 3, 2));
        }
        if (!quizPlatformService.questionExists(9108L)) {
            quizPlatformService.addQuestion(new Question(9108L, "Leaderboard sorting uses?", List.of("BST", "Graph DFS", "Max Heap", "Segment Tree"), 2, "Heap", 2, 2));
        }
    }
}
