package com.tejaswin.quizplatform.auth;

public record AuthResponse(
        String accessToken,
        String tokenType,
        long expiresInSeconds,
        Long userId,
        String name,
        String email,
        String role
) {
}
