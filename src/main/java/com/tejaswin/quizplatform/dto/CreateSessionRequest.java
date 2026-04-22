package com.tejaswin.quizplatform.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CreateSessionRequest(
        @NotBlank String title,
        @NotEmpty List<@NotNull Long> questionIds,
        @Min(5) Integer questionDurationSeconds
) {
}
