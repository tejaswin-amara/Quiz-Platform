package com.tejaswin.quizplatform.service;

import com.tejaswin.quizplatform.exception.NotFoundException;
import com.tejaswin.quizplatform.model.LeaderboardEntry;
import com.tejaswin.quizplatform.model.Question;
import com.tejaswin.quizplatform.persistence.entity.UserEntity;
import com.tejaswin.quizplatform.persistence.entity.UserRole;
import com.tejaswin.quizplatform.persistence.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.TestPropertySource;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:quiz-platform-session;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class SessionFlowServiceTest {

    @Autowired
    private QuizPlatformService quizPlatformService;

    @Autowired
    private SessionService sessionService;

    @Autowired
    private UserRepository userRepository;

    private Long hostUserId;
    private Long playerUserId;
    private Long otherUserId;

    @BeforeEach
    void setup() {
        userRepository.deleteAll();
        UserEntity host = new UserEntity();
        host.setEmail("host-session@test.com");
        host.setDisplayName("Host");
        host.setPasswordHash("hash");
        host.setRole(UserRole.HOST);
        hostUserId = userRepository.save(host).getId();

        UserEntity player = new UserEntity();
        player.setEmail("player-session@test.com");
        player.setDisplayName("Player");
        player.setPasswordHash("hash");
        player.setRole(UserRole.USER);
        playerUserId = userRepository.save(player).getId();

        UserEntity other = new UserEntity();
        other.setEmail("other-session@test.com");
        other.setDisplayName("Other");
        other.setPasswordHash("hash");
        other.setRole(UserRole.USER);
        otherUserId = userRepository.save(other).getId();

        quizPlatformService.addQuestion(new Question(2001, "Q1", List.of("a", "b"), 1, "Arrays", 2, 2));
        quizPlatformService.addQuestion(new Question(2002, "Q2", List.of("a", "b"), 0, "Graphs", 3, 3));
    }

    @Test
    void shouldRunLiveSessionFlowAndUpdateHeapLeaderboard() {
        Map<String, Object> created = sessionService.createSession(hostUserId, "Live Session", List.of(2001L, 2002L), 8);
        String sessionId = String.valueOf(created.get("sessionId"));

        String p1 = String.valueOf(sessionService.joinSession(sessionId, "Alice", playerUserId).get("participantId"));
        String p2 = String.valueOf(sessionService.joinSession(sessionId, "Bob", null).get("participantId"));

        Map<String, Object> questionPayload = sessionService.getSessionQuestion(sessionId, true, hostUserId);
        assertEquals("LIVE", questionPayload.get("state"));

        Map<String, Object> p1Answer = sessionService.submitSessionAnswer(sessionId, p1, 1, playerUserId);
        Map<String, Object> p2Answer = sessionService.submitSessionAnswer(sessionId, p2, 0, hostUserId);

        assertEquals(true, p1Answer.get("isCorrect"));
        assertEquals(false, p2Answer.get("isCorrect"));

        List<LeaderboardEntry> leaderboard = sessionService.sessionLeaderboard(sessionId);
        assertFalse(leaderboard.isEmpty());
        assertEquals("Alice", leaderboard.get(0).participantName());

        Map<String, Object> results = sessionService.sessionResults(sessionId);
        assertNotNull(results.get("totalScoreRange"));
        assertNotNull(results.get("lisPerformanceTrend"));
        assertNotNull(results.get("averageScore"));
    }

    @Test
    void shouldRejectDuplicateJoinAndInvalidAnswer() {
        String sessionId = String.valueOf(sessionService.createSession(hostUserId, "Live Session", List.of(2001L), 8).get("sessionId"));
        String participantId = String.valueOf(sessionService.joinSession(sessionId, "Alice", playerUserId).get("participantId"));

        assertThrows(IllegalArgumentException.class, () -> sessionService.joinSession(sessionId, "alice", null));

        sessionService.getSessionQuestion(sessionId, true, hostUserId);

        assertThrows(IllegalArgumentException.class, () -> sessionService.submitSessionAnswer(sessionId, participantId, 5, playerUserId));
        assertThrows(NotFoundException.class, () -> sessionService.submitSessionAnswer("SZZZZZZZZ", participantId, 0, playerUserId));
    }

    @Test
    void shouldRejectSubmittingAnswersForAnotherAuthenticatedParticipant() {
        String sessionId = String.valueOf(sessionService.createSession(hostUserId, "Live Session", List.of(2001L), 8).get("sessionId"));
        String participantId = String.valueOf(sessionService.joinSession(sessionId, "Alice", playerUserId).get("participantId"));
        sessionService.getSessionQuestion(sessionId, true, hostUserId);

        assertThrows(AccessDeniedException.class, () -> sessionService.submitSessionAnswer(sessionId, participantId, 1, otherUserId));
    }

    @Test
    void shouldSupportMultipleParticipantsJoining() {
        String sessionId = String.valueOf(sessionService.createSession(hostUserId, "Load Session", List.of(2001L), 8).get("sessionId"));
        for (int i = 0; i < 15; i++) {
            sessionService.joinSession(sessionId, "Player-" + i, null);
        }

        Map<String, Object> lobby = sessionService.getSessionQuestion(sessionId, false, hostUserId);
        assertEquals("LOBBY", lobby.get("state"));
        assertEquals(15, lobby.get("playerCount"));
    }

    @Test
    void shouldMarkSessionCompletedAfterDurationElapses() throws InterruptedException {
        String sessionId = String.valueOf(sessionService.createSession(hostUserId, "Timed Session", List.of(2001L), 5).get("sessionId"));
        sessionService.joinSession(sessionId, "Alice", playerUserId);
        sessionService.getSessionQuestion(sessionId, true, hostUserId);

        Thread.sleep(5_200);

        Map<String, Object> state = sessionService.getSessionQuestion(sessionId, false, hostUserId);
        assertEquals("COMPLETED", state.get("state"));
        assertTrue(state.containsKey("playerCount"));
    }

    @Test
    void shouldCreateReadyDemoSessionInOneCall() {
        Map<String, Object> demo = sessionService.startDemoSession(hostUserId);
        assertNotNull(demo.get("sessionId"));
        assertEquals(4, demo.get("playerCount"));
    }
}
