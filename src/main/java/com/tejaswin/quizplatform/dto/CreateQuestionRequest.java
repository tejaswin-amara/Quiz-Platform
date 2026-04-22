package com.tejaswin.quizplatform.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record CreateQuestionRequest(
        @Min(1) long id,
        @NotBlank String text,
        @NotEmpty List<@NotBlank String> options,
        @Min(0) int correctOption,
        @NotBlank String topic,
        @Min(1) int difficulty,
        @Min(1) int weight
) {
}
