package com.tejaswin.quizplatform.auth;

import com.tejaswin.quizplatform.persistence.entity.UserEntity;
import com.tejaswin.quizplatform.persistence.entity.UserRole;
import com.tejaswin.quizplatform.persistence.repository.UserRepository;
import com.tejaswin.quizplatform.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(AuthRegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException("Email is already registered");
        }

        UserRole role = resolveRole(request.role());
        UserEntity entity = new UserEntity();
        entity.setDisplayName(request.name().trim());
        entity.setEmail(normalizedEmail);
        entity.setPasswordHash(passwordEncoder.encode(request.password()));
        entity.setRole(role);
        UserEntity saved = userRepository.save(entity);
        return issueToken(saved);
    }

    public AuthResponse login(AuthLoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        UserEntity entity = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), entity.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        return issueToken(entity);
    }

    private AuthResponse issueToken(UserEntity user) {
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name(), user.getDisplayName());
        return new AuthResponse(
                token,
                "Bearer",
                jwtService.getExpirationSeconds(),
                user.getId(),
                user.getDisplayName(),
                user.getEmail(),
                user.getRole().name()
        );
    }

    private UserRole resolveRole(String roleRaw) {
        if (roleRaw == null || roleRaw.isBlank()) {
            return UserRole.USER;
        }
        UserRole role = UserRole.valueOf(roleRaw.trim().toUpperCase());
        if (role == UserRole.ADMIN) {
            throw new IllegalArgumentException("ADMIN role cannot be self-assigned");
        }
        return role;
    }
}
