package com.tejaswin.quizplatform.security;

import com.tejaswin.quizplatform.persistence.entity.UserRole;

public record AuthenticatedUser(
        Long userId,
        String email,
        String name,
        UserRole role
) {
}
