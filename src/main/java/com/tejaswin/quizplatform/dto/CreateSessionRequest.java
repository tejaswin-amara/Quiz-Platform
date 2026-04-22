package com.tejaswin.quizplatform.dto;

import java.util.List;

public record CreateSessionRequest(String title, List<Long> questionIds, Integer questionDurationSeconds) {
}
