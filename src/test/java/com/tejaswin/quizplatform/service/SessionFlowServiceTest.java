package com.tejaswin.quizplatform.service;

import com.tejaswin.quizplatform.exception.NotFoundException;
import com.tejaswin.quizplatform.model.LeaderboardEntry;
import com.tejaswin.quizplatform.model.Question;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
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

    @BeforeEach
    void setup() {
        quizPlatformService.addQuestion(new Question(2001, "Q1", List.of("a", "b"), 1, "Arrays", 2, 2));
        quizPlatformService.addQuestion(new Question(2002, "Q2", List.of("a", "b"), 0, "Graphs", 3, 3));
    }

    @Test
    void shouldRunLiveSessionFlowAndUpdateHeapLeaderboard() {
        Map<String, Object> created = sessionService.createSession("Live Session", List.of(2001L, 2002L), 8);
        String sessionId = String.valueOf(created.get("sessionId"));

        String p1 = String.valueOf(sessionService.joinSession(sessionId, "Alice").get("participantId"));
        String p2 = String.valueOf(sessionService.joinSession(sessionId, "Bob").get("participantId"));

        Map<String, Object> questionPayload = sessionService.getSessionQuestion(sessionId, true);
        assertEquals("LIVE", questionPayload.get("state"));

        Map<String, Object> p1Answer = sessionService.submitSessionAnswer(sessionId, p1, 1);
        Map<String, Object> p2Answer = sessionService.submitSessionAnswer(sessionId, p2, 0);

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
        String sessionId = String.valueOf(sessionService.createSession("Live Session", List.of(2001L), 8).get("sessionId"));
        String participantId = String.valueOf(sessionService.joinSession(sessionId, "Alice").get("participantId"));

        assertThrows(IllegalArgumentException.class, () -> sessionService.joinSession(sessionId, "alice"));

        sessionService.getSessionQuestion(sessionId, true);

        assertThrows(IllegalArgumentException.class, () -> sessionService.submitSessionAnswer(sessionId, participantId, 5));
        assertThrows(NotFoundException.class, () -> sessionService.submitSessionAnswer("SZZZZZZZZ", participantId, 0));
    }

    @Test
    void shouldSupportMultipleParticipantsJoining() {
        String sessionId = String.valueOf(sessionService.createSession("Load Session", List.of(2001L), 8).get("sessionId"));
        for (int i = 0; i < 15; i++) {
            sessionService.joinSession(sessionId, "Player-" + i);
        }

        Map<String, Object> lobby = sessionService.getSessionQuestion(sessionId, false);
        assertEquals("LOBBY", lobby.get("state"));
        assertEquals(15, lobby.get("playerCount"));
    }

    @Test
    void shouldMarkSessionCompletedAfterDurationElapses() throws InterruptedException {
        String sessionId = String.valueOf(sessionService.createSession("Timed Session", List.of(2001L), 5).get("sessionId"));
        sessionService.joinSession(sessionId, "Alice");
        sessionService.getSessionQuestion(sessionId, true);

        Thread.sleep(5_200);

        Map<String, Object> state = sessionService.getSessionQuestion(sessionId, false);
        assertEquals("COMPLETED", state.get("state"));
        assertTrue(state.containsKey("playerCount"));
    }

    @Test
    void shouldCreateReadyDemoSessionInOneCall() {
        Map<String, Object> demo = sessionService.startDemoSession();
        assertNotNull(demo.get("sessionId"));
        assertEquals(4, demo.get("playerCount"));
    }
}
