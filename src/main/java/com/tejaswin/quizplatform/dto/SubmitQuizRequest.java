package com.tejaswin.quizplatform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

public record SubmitQuizRequest(
        @NotBlank String participantId,
        @NotEmpty Map<@NotNull Long, @NotNull @Min(0) Integer> answers
) {
}
