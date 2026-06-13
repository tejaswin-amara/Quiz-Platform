package com.tejaswin.quizplatform.service;

import com.tejaswin.quizplatform.model.Question;
import com.tejaswin.quizplatform.persistence.entity.SessionEntity;
import com.tejaswin.quizplatform.persistence.entity.UserEntity;
import com.tejaswin.quizplatform.persistence.entity.UserRole;
import com.tejaswin.quizplatform.persistence.repository.SessionRepository;
import com.tejaswin.quizplatform.persistence.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.TestPropertySource;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Regression tests for bugs fixed in the comprehensive audit pass.
 * Each test is named after the bug it guards against.
 */
@SpringBootTest
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:quiz-platform-regression;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class BugFixRegressionTest {

    @Autowired private QuizPlatformService quizPlatformService;
    @Autowired private SessionService sessionService;
    @Autowired private UserRepository userRepository;
    @Autowired private SessionRepository sessionRepository;

    private Long hostUserId;
    private Long otherHostId;

    @BeforeEach
    void setup() {
        userRepository.deleteAll();

        UserEntity host = new UserEntity();
        host.setEmail("host-regression@test.com");
        host.setDisplayName("Host");
        host.setPasswordHash("hash");
        host.setRole(UserRole.HOST);
        hostUserId = userRepository.save(host).getId();

        UserEntity other = new UserEntity();
        other.setEmail("other-regression@test.com");
        other.setDisplayName("OtherHost");
        other.setPasswordHash("hash");
        other.setRole(UserRole.HOST);
        otherHostId = userRepository.save(other).getId();

        // Two questions sufficient for all test scenarios
        quizPlatformService.addQuestion(
                new Question(3001, "Reg-Q1", List.of("a", "b"), 0, "Arrays", 2, 2));
        quizPlatformService.addQuestion(
                new Question(3002, "Reg-Q2", List.of("a", "b"), 1, "Graphs", 3, 3));
    }

    // ── BUG-2 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("BUG-2: non-owner host gets AccessDeniedException (→ HTTP 403), not IllegalStateException")
    void requireHostOwnerThrowsAccessDeniedException() {
        Map<String, Object> created = sessionService.createSession(
                hostUserId, "Owner Test", List.of(3001L), 30);
        String sessionId = String.valueOf(created.get("sessionId"));

        // otherHostId did not create this session
        assertThrows(
                AccessDeniedException.class,
                () -> sessionService.pauseSession(sessionId, otherHostId),
                "Non-owner host must receive AccessDeniedException (HTTP 403)");
    }

    // ── BUG-4 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("BUG-4: forceNextQuestion on the last question transitions state to COMPLETED")
    void forceNextQuestionAtLastQuestionEndsSession() {
        Map<String, Object> created = sessionService.createSession(
                hostUserId, "Force-Next Test", List.of(3001L, 3002L), 30);
        String sessionId = String.valueOf(created.get("sessionId"));

        // Need at least one player to start
        sessionService.joinSession(sessionId, "Alice", null);
        // Start the session (Q0)
        sessionService.getSessionQuestion(sessionId, true, hostUserId);

        // Advance to Q1 (last question for a 2-question quiz)
        Map<String, Object> afterFirst = sessionService.forceNextQuestion(sessionId, hostUserId);
        assertEquals("LIVE", afterFirst.get("state"),
                "After advancing to Q1 session should still be LIVE");
        assertEquals(1, ((Number) afterFirst.get("forcedQuestionIndex")).intValue());

        // Force-advance again: already at last question — must complete
        Map<String, Object> afterLast = sessionService.forceNextQuestion(sessionId, hostUserId);
        assertEquals("COMPLETED", afterLast.get("state"),
                "Forcing next on the last question must set state to COMPLETED");

        // Verify persisted in DB — SessionRepository.findById uses sessionId as @Id
        SessionEntity persisted = sessionRepository.findById(sessionId).orElseThrow();
        assertEquals("COMPLETED", persisted.getState());
    }

    // ── BUG-5a ─────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("BUG-5: completed sessions are NOT removed by the short-term active-session cleanup")
    void completedSessionsAreNotDeletedByShortTermCleanup() {
        Map<String, Object> created = sessionService.createSession(
                hostUserId, "Cleanup Test", List.of(3001L), 5);
        String sessionId = String.valueOf(created.get("sessionId"));

        sessionService.joinSession(sessionId, "Alice", null);
        sessionService.getSessionQuestion(sessionId, true, hostUserId);
        sessionService.endSession(sessionId, hostUserId);  // → COMPLETED

        // Backdate to 46 min ago (beyond active-session expiry of 45 min)
        SessionEntity session = sessionRepository.findById(sessionId).orElseThrow();
        session.setLastActivityEpochMs(System.currentTimeMillis() - 46L * 60 * 1000);
        sessionRepository.save(session);

        sessionService.cleanupExpiredSessions();

        assertTrue(
                sessionRepository.findById(sessionId).isPresent(),
                "COMPLETED session must survive the short-term active-session cleanup window");
    }

    // ── BUG-5b ─────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("BUG-5: stale non-completed sessions ARE removed by cleanup")
    void staleActiveSessionsAreRemovedByCleanup() {
        Map<String, Object> created = sessionService.createSession(
                hostUserId, "Stale Lobby", List.of(3001L), 30);
        String sessionId = String.valueOf(created.get("sessionId"));

        // Verify it is in LOBBY state
        SessionEntity session = sessionRepository.findById(sessionId).orElseThrow();
        assertEquals("LOBBY", session.getState());

        // Backdate to 46 min ago
        session.setLastActivityEpochMs(System.currentTimeMillis() - 46L * 60 * 1000);
        sessionRepository.save(session);

        sessionService.cleanupExpiredSessions();

        assertTrue(
                sessionRepository.findById(sessionId).isEmpty(),
                "Stale LOBBY sessions must be removed by cleanup");
    }
}
