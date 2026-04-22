package com.tejaswin.quizplatform.service;

import com.tejaswin.quizplatform.model.LeaderboardEntry;
import com.tejaswin.quizplatform.model.Question;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class SessionFlowServiceTest {

    private QuizPlatformService service;

    @BeforeEach
    void setup() {
        service = new QuizPlatformService();
        service.addQuestion(new Question(1, "Q1", List.of("a", "b"), 1, "Arrays", 2, 2));
        service.addQuestion(new Question(2, "Q2", List.of("a", "b"), 0, "Graphs", 3, 3));
    }

    @Test
    void shouldRunLiveSessionFlowAndUpdateHeapLeaderboard() {
        Map<String, Object> created = service.createSession("Live Session", List.of(1L, 2L), 8);
        String sessionId = String.valueOf(created.get("sessionId"));

        String p1 = String.valueOf(service.joinSession(sessionId, "Alice").get("participantId"));
        String p2 = String.valueOf(service.joinSession(sessionId, "Bob").get("participantId"));

        Map<String, Object> questionPayload = service.getSessionQuestion(sessionId, true);
        assertEquals("LIVE", questionPayload.get("state"));

        Map<String, Object> p1Answer = service.submitSessionAnswer(sessionId, p1, 1);
        Map<String, Object> p2Answer = service.submitSessionAnswer(sessionId, p2, 0);

        assertEquals(true, p1Answer.get("isCorrect"));
        assertEquals(false, p2Answer.get("isCorrect"));

        List<LeaderboardEntry> leaderboard = service.sessionLeaderboard(sessionId);
        assertFalse(leaderboard.isEmpty());
        assertEquals("Alice", leaderboard.get(0).participantName());

        Map<String, Object> results = service.sessionResults(sessionId);
        assertNotNull(results.get("totalScoreRange"));
        assertNotNull(results.get("lisPerformanceTrend"));
    }
}
