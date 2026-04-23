package com.tejaswin.quizplatform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record JoinSessionRequest(
        @NotBlank @Pattern(regexp = "^S[A-Z0-9]{8}$", message = "sessionId format is invalid") String sessionId,
        @NotBlank String participantName
) {
}
