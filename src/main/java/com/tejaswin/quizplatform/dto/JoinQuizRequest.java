package com.tejaswin.quizplatform.dto;

import jakarta.validation.constraints.NotBlank;

public record JoinQuizRequest(@NotBlank String participantName) {
}
