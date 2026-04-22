package com.tejaswin.quizplatform.dto;

import jakarta.validation.constraints.NotBlank;

public record JoinSessionRequest(@NotBlank String sessionId, @NotBlank String participantName) {
}
