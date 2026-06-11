package com.tejaswin.quizplatform.security;

import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class AuthContext {
    private AuthContext() {
    }

    /**
     * Returns the currently authenticated user.
     * Throws InsufficientAuthenticationException (→ HTTP 401) if no valid JWT is present.
     */
    public static AuthenticatedUser requireUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser user)) {
            throw new InsufficientAuthenticationException("Authentication required");
        }
        return user;
    }

    /**
     * Returns the currently authenticated user, or null for unauthenticated requests.
     * Use for endpoints that are permitAll() but can optionally use the caller identity.
     */
    public static AuthenticatedUser optionalUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser user)) {
            return null;
        }
        return user;
    }
}
