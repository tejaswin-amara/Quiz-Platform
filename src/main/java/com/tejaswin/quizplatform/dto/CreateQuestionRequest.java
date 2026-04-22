package com.tejaswin.quizplatform.dto;

import java.util.List;

public record CreateQuestionRequest(
        long id,
        String text,
        List<String> options,
        int correctOption,
        String topic,
        int difficulty,
        int weight
) {
}
