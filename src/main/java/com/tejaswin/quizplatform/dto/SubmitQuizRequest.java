package com.tejaswin.quizplatform.dto;

import java.util.Map;

public record SubmitQuizRequest(String participantId, Map<Long, Integer> answers) {
}
