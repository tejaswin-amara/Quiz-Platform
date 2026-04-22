package com.tejaswin.quizplatform.service;

import com.tejaswin.quizplatform.model.LeaderboardEntry;
import com.tejaswin.quizplatform.model.Question;
import com.tejaswin.quizplatform.model.Quiz;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class SessionService {
    private static final Logger log = LoggerFactory.getLogger(SessionService.class);
    private static final int POINTS_PER_DIFFICULTY_LEVEL = 10;

    private final Map<String, LiveSession> sessions = new HashMap<>();

    private final QuizPlatformService quizPlatformService;
    private final LeaderboardService leaderboardService;
    private final AnalyticsService analyticsService;
    private final int defaultQuestionDurationSeconds;
    private final int expiryMinutes;

    public SessionService(
            QuizPlatformService quizPlatformService,
            LeaderboardService leaderboardService,
            AnalyticsService analyticsService,
            @Value("${quiz.session.default-question-duration-seconds:15}") int defaultQuestionDurationSeconds,
            @Value("${quiz.session.expiry-minutes:45}") int expiryMinutes
    ) {
        this.quizPlatformService = quizPlatformService;
        this.leaderboardService = leaderboardService;
        this.analyticsService = analyticsService;
        this.defaultQuestionDurationSeconds = defaultQuestionDurationSeconds;
        this.expiryMinutes = expiryMinutes;
    }

    public synchronized Map<String, Object> createSession(String title, List<Long> questionIds, Integer questionDurationSeconds) {
        Quiz quiz = quizPlatformService.createQuiz(title, questionIds);
        String sessionId = "S" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        LiveSession session = new LiveSession(
                sessionId,
                quiz.code(),
                Math.max(5, questionDurationSeconds == null ? defaultQuestionDurationSeconds : questionDurationSeconds)
        );
        sessions.put(sessionId, session);

        log.info("event=session_created sessionId={} quizCode={} durationSec={}", sessionId, quiz.code(), session.questionDurationSeconds);

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
        if (participantName == null || participantName.isBlank()) {
            throw new IllegalArgumentException("participantName is required");
        }
        String normalizedName = participantName.trim();
        boolean alreadyJoined = session.participants.values().stream().anyMatch(existing -> existing.equalsIgnoreCase(normalizedName));
        if (alreadyJoined) {
            throw new IllegalArgumentException("Participant with this name already joined");
        }

        String participantId = UUID.randomUUID().toString();
        session.participants.put(participantId, normalizedName);
        session.scores.put(participantId, 0);
        session.scoreHistory.put(participantId, new ArrayList<>(List.of(0)));
        session.touch();

        log.info("event=session_joined sessionId={} participantId={} participantName={}", sessionId, participantId, normalizedName);

        return Map.of(
                "sessionId", sessionId,
                "participantId", participantId,
                "participantName", normalizedName,
                "state", session.state
        );
    }

    public synchronized Map<String, Object> getSessionQuestion(String sessionId, boolean start) {
        LiveSession session = ensureSessionExists(sessionId);
        if ("LOBBY".equals(session.state) && start) {
            if (session.participants.isEmpty()) {
                throw new IllegalStateException("Cannot start without participants");
            }
            session.state = "LIVE";
            session.startEpochMs = System.currentTimeMillis();
            log.info("event=session_started sessionId={} participants={}", sessionId, session.participants.size());
        }
        updateSessionState(session);
        session.touch();

        if (!"LIVE".equals(session.state)) {
            return Map.of(
                    "sessionId", sessionId,
                    "state", session.state,
                    "players", session.participants.values(),
                    "playerCount", session.participants.size()
            );
        }

        List<Question> questions = quizPlatformService.getQuizQuestions(session.quizCode);
        if (questions.isEmpty()) {
            throw new IllegalStateException("Session has no valid questions");
        }

        int index = currentQuestionIndex(session, questions.size());
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
        if (participantId == null || participantId.isBlank()) {
            throw new IllegalArgumentException("participantId is required");
        }
        LiveSession session = ensureSessionExists(sessionId);
        updateSessionState(session);
        if (!"LIVE".equals(session.state)) {
            throw new IllegalStateException("Session is not live");
        }
        if (!session.participants.containsKey(participantId)) {
            throw new IllegalArgumentException("Participant has not joined this session");
        }

        List<Question> questions = quizPlatformService.getQuizQuestions(session.quizCode);
        int index = currentQuestionIndex(session, questions.size());
        String answerKey = participantId + ":" + index;
        if (session.submittedAnswers.contains(answerKey)) {
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

        session.submittedAnswers.add(answerKey);
        boolean isCorrect = answerOption == current.correctOption();

        int existing = session.scores.getOrDefault(participantId, 0);
        int updated = existing;
        if (isCorrect) {
            updated += current.difficulty() * POINTS_PER_DIFFICULTY_LEVEL;
        }
        session.scores.put(participantId, updated);
        session.scoreHistory.get(participantId).add(updated);
        session.touch();

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

    public synchronized List<LeaderboardEntry> sessionLeaderboard(String sessionId) {
        LiveSession session = ensureSessionExists(sessionId);
        session.touch();
        List<LeaderboardEntry> ranked = leaderboardService.rank(session.scores, session.participants);
        log.info("event=session_leaderboard_updated sessionId={} leaderboardSize={}", sessionId, ranked.size());
        return ranked;
    }

    public synchronized Map<String, Object> sessionResults(String sessionId) {
        LiveSession session = ensureSessionExists(sessionId);
        updateSessionState(session);
        session.touch();

        List<LeaderboardEntry> leaderboard = sessionLeaderboard(sessionId);
        int totalScoreRange = analyticsService.totalScoreRange(leaderboard);

        Map<String, Integer> lisByParticipant = new HashMap<>();
        int totalScore = 0;
        for (LeaderboardEntry entry : leaderboard) {
            totalScore += entry.score();
        }
        double averageScore = leaderboard.isEmpty() ? 0.0 : (double) totalScore / leaderboard.size();

        for (Map.Entry<String, List<Integer>> entry : session.scoreHistory.entrySet()) {
            lisByParticipant.put(entry.getKey(), analyticsService.lisTrend(entry.getValue()));
        }

        Map<Integer, Integer> difficultyImpact = new HashMap<>();
        List<Question> sessionQuestions = quizPlatformService.getQuizQuestions(session.quizCode);
        for (Question question : sessionQuestions) {
            difficultyImpact.merge(question.difficulty(), question.difficulty() * POINTS_PER_DIFFICULTY_LEVEL, Integer::sum);
        }

        return Map.of(
                "sessionId", sessionId,
                "state", session.state,
                "leaderboard", leaderboard,
                "totalScoreRange", totalScoreRange,
                "averageScore", averageScore,
                "difficultyImpact", difficultyImpact,
                "lisPerformanceTrend", lisByParticipant,
                "complexity", Map.of(
                        "heapLeaderboard", "O(n log n)",
                        "segmentTreeRange", "O(log n)",
                        "lis", "O(n^2)"
                )
        );
    }

    @Scheduled(fixedDelayString = "${quiz.session.cleanup-interval-ms:60000}")
    public synchronized void cleanupExpiredSessions() {
        long now = System.currentTimeMillis();
        long expiryMillis = expiryMinutes * 60_000L;
        int before = sessions.size();
        sessions.entrySet().removeIf(entry -> now - entry.getValue().lastActivityEpochMs > expiryMillis);
        int removed = before - sessions.size();
        if (removed > 0) {
            log.info("event=session_cleanup removed={} remaining={}", removed, sessions.size());
        }
    }

    private void updateSessionState(LiveSession session) {
        // Session progress is time-driven so all clients observe the same question index.
        if (!"LIVE".equals(session.state)) {
            return;
        }
        int totalQuestions = quizPlatformService.getQuizQuestions(session.quizCode).size();
        int elapsedSeconds = (int) ((System.currentTimeMillis() - session.startEpochMs) / 1000L);
        if (elapsedSeconds >= totalQuestions * session.questionDurationSeconds) {
            session.state = "COMPLETED";
        }
    }

    private int currentQuestionIndex(LiveSession session, int totalQuestions) {
        // Integer division maps elapsed time windows to question slots.
        int elapsedSeconds = (int) ((System.currentTimeMillis() - session.startEpochMs) / 1000L);
        int index = elapsedSeconds / session.questionDurationSeconds;
        int maxIndex = Math.max(0, totalQuestions - 1);
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
        private long lastActivityEpochMs = System.currentTimeMillis();

        private LiveSession(String sessionId, String quizCode, int questionDurationSeconds) {
            this.sessionId = sessionId;
            this.quizCode = quizCode;
            this.questionDurationSeconds = questionDurationSeconds;
        }

        private void touch() {
            this.lastActivityEpochMs = System.currentTimeMillis();
        }
    }
}
