package com.tejaswin.quizplatform.service;

import com.tejaswin.quizplatform.model.Question;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class QuizPlatformServiceTest {

    private QuizPlatformService service;

    @BeforeEach
    void setup() {
        service = new QuizPlatformService();
        service.addQuestion(new Question(1, "Q1", List.of("a", "b"), 1, "Arrays", 2, 2));
        service.addQuestion(new Question(2, "Q2", List.of("a", "b"), 0, "Graphs", 3, 3));
    }

    @Test
    void shouldRunEndToEndQuizFlowWithDsaIntegrations() {
        String quizCode = service.createQuiz("DSA", List.of(1L, 2L)).code();
        String participantId = service.joinQuiz(quizCode, "Tejas").get("participantId");

        Map<String, Object> result = service.submitAnswers(quizCode, participantId, Map.of(1L, 1, 2L, 0));
        assertEquals(50, result.get("score"));

        assertFalse(service.leaderboard(quizCode).isEmpty());

        Map<String, Object> analytics = service.analytics(quizCode, 0, 0, participantId);
        assertNotNull(analytics.get("rangeScoreSum"));

        Map<String, Object> optimized = service.optimizeQuiz(quizCode, 3);
        assertNotNull(optimized.get("selectedQuestions"));

        assertFalse(service.recommendTopics("Arrays", "bfs").isEmpty());
    }
}
