package com.tejaswin.quizplatform.model;

import java.util.List;

public record Quiz(
        String code,
        String title,
        List<Long> questionIds
) {
}
