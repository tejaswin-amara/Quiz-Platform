package com.tejaswin.quizplatform.service;

import com.tejaswin.quizplatform.model.Question;
import com.tejaswin.quizplatform.persistence.entity.SessionEntity;
import com.tejaswin.quizplatform.persistence.entity.UserEntity;
import com.tejaswin.quizplatform.persistence.entity.UserRole;
import com.tejaswin.quizplatform.persistence.repository.PlayerRepository;
import com.tejaswin.quizplatform.persistence.repository.ResultRepository;
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
    @Autowired private PlayerRepository playerRepository;
    @Autowired private ResultRepository resultRepository;

    private Long hostUserId;
    private Long otherHostId;

    @BeforeEach
    void setup() {
        // fresh state per test
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

        // two questions so we can advance from Q0 → Q1 and then test last-Q boundary
        quizPlatformService.addQuestion(new Question(3001, "Reg-Q1", List.of("a", "b"), 0, "Arrays", 2, 2));
        quizPlatformService.addQuestion(new Question(3002, "Reg-Q2", List.of("a", "b"), 1, "Graphs", 3, 3));
    }

    // ── BUG-2 ──────────────────────────────────────────────────────────────
    @Test
    @DisplayName("BUG-2: requireHostOwner throws AccessDeniedException (403), not IllegalStateException (400)")
    void requireHostOwnerThrowsAccessDeniedException() {
        Map<String, Object> created = sessionService.createSession(
                hostUserId, "Owner Test", List.of(3001L, 3002L), 30);
        String sessionId = String.valueOf(created.get("sessionId"));

        // A different authenticated host who did NOT create the session
        assertThrows(AccessDeniedException.class,
                () -> sessionService.pauseSession(sessionId, otherHostId),
                "Non-owner host must receive AccessDeniedException (→ HTTP 403)");
    }

    // ── BUG-4 ──────────────────────────────────────────────────────────────
    @Test
    @DisplayName("BUG-4: forceNextQuestion completes session when already at last question")
    void forceNextQuestionAtLastQuestionEndsSession() {
        Map<String, Object> created = sessionService.createSession(
                hostUserId, "Force-Next Test", List.of(3001L, 3002L), 30);
        String sessionId = String.valueOf(created.get("sessionId"));
        sessionService.joinSession(sessionId, "Alice", null);

        // Start the session (moves to Q0)
        sessionService.getSessionQuestion(sessionId, true, hostUserId);

        // Force-advance to Q1 (last question)
        Map<String, Object> afterFirst = sessionService.forceNextQuestion(sessionId, hostUserId);
        assertEquals("LIVE", afterFirst.get("state"), "After first force-next session should still be LIVE");
        assertEquals(1, ((Number) afterFirst.get("forcedQuestionIndex")).intValue());

        // Force-advance again: already at last question → session must complete
        Map<String, Object> afterLast = sessionService.forceNextQuestion(sessionId, hostUserId);
        assertEquals("COMPLETED", afterLast.get("state"),
                "Forcing next on the last question must transition state to COMPLETED");

        // Verify state persisted in DB
        SessionEntity persisted = sessionRepository.findBySessionId(sessionId).orElseThrow();
        assertEquals("COMPLETED", persisted.getState());
    }

    // ── BUG-5 ──────────────────────────────────────────────────────────────
    @Test
    @DisplayName("BUG-5: cleanupExpiredSessions must not delete COMPLETED sessions within 7-day window")
    void completedSessionsAreNotDeletedByShortTermCleanup() {
        // Create and immediately complete a session
        Map<String, Object> created = sessionService.createSession(
                hostUserId, "Cleanup Test", List.of(3001L), 5);
        String sessionId = String.valueOf(created.get("sessionId"));
        sessionService.joinSession(sessionId, "Alice", null);
        sessionService.getSessionQuestion(sessionId, true, hostUserId);
        sessionService.endSession(sessionId, hostUserId);   // → COMPLETED

        // Backdate the lastActivityEpochMs to simulate 46-minute-old session
        // (older than the active-session expiry of 45 min, but within 7-day completed-session window)
        SessionEntity session = sessionRepository.findBySessionId(sessionId).orElseThrow();
        session.setLastActivityEpochMs(System.currentTimeMillis() - 46L * 60 * 1000);
        sessionRepository.save(session);

        // Run cleanup: should NOT delete this COMPLETED session
        sessionService.cleanupExpiredSessions();

        assertTrue(sessionRepository.findBySessionId(sessionId).isPresent(),
                "COMPLETED session should survive the short-term active-session cleanup window");
    }

    // ── BUG-5 complementary ────────────────────────────────────────────────
    @Test
    @DisplayName("BUG-5: cleanupExpiredSessions DOES remove stale non-completed sessions")
    void staleActiveSessionsAreRemovedByCleanup() {
        Map<String, Object> created = sessionService.createSession(
                hostUserId, "Stale Lobby", List.of(3001L), 30);
        String sessionId = String.valueOf(created.get("sessionId"));

        // Session is in LOBBY state — never started. Backdate to 46 min ago.
        SessionEntity session = sessionRepository.findBySessionId(sessionId).orElseThrow();
        assertEquals("LOBBY", session.getState());
        session.setLastActivityEpochMs(System.currentTimeMillis() - 46L * 60 * 1000);
        sessionRepository.save(session);

        sessionService.cleanupExpiredSessions();

        assertTrue(sessionRepository.findBySessionId(sessionId).isEmpty(),
                "Stale LOBBY sessions must be removed by cleanup");
    }
}
