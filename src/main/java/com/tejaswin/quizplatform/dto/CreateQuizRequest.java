package com.tejaswin.quizplatform.dto;

import java.util.List;

public record CreateQuizRequest(String title, List<Long> questionIds) {
}
