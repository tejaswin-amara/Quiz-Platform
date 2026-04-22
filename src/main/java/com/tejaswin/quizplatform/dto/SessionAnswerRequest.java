package com.tejaswin.quizplatform.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record SessionAnswerRequest(@NotBlank String participantId, @Min(0) int answerOption) {
}
