package com.tejaswin.quizplatform.persistence.repository;

import com.tejaswin.quizplatform.persistence.entity.PlayerEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlayerRepository extends JpaRepository<PlayerEntity, String> {
    List<PlayerEntity> findBySessionId(String sessionId);

    long countBySessionId(String sessionId);

    boolean existsBySessionIdAndParticipantNameIgnoreCase(String sessionId, String participantName);

    boolean existsBySessionIdAndUserId(String sessionId, Long userId);

    Optional<PlayerEntity> findByParticipantIdAndSessionId(String participantId, String sessionId);

    Optional<PlayerEntity> findBySessionIdAndParticipantNameIgnoreCase(String sessionId, String participantName);

    void deleteByParticipantIdAndSessionId(String participantId, String sessionId);

    void deleteBySessionId(String sessionId);
}
