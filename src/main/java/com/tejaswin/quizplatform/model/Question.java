package com.tejaswin.quizplatform.model;

import java.util.List;

public record Question(
        long id,
        String text,
        List<String> options,
        int correctOption,
        String topic,
        int difficulty,
        int weight
) {
}
