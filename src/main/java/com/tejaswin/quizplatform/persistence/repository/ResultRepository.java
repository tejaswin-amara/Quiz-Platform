package com.tejaswin.quizplatform.persistence.repository;

import com.tejaswin.quizplatform.persistence.entity.ResultEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResultRepository extends JpaRepository<ResultEntity, Long> {
    boolean existsBySessionIdAndParticipantIdAndQuestionIndex(String sessionId, String participantId, Integer questionIndex);

    List<ResultEntity> findBySessionId(String sessionId);

    List<ResultEntity> findBySessionIdAndQuestionIndex(String sessionId, Integer questionIndex);

    void deleteBySessionIdAndParticipantId(String sessionId, String participantId);

    void deleteBySessionId(String sessionId);
}
