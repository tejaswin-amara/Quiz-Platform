package com.tejaswin.quizplatform.persistence.repository;

import com.tejaswin.quizplatform.persistence.entity.SessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SessionRepository extends JpaRepository<SessionEntity, String> {
    List<SessionEntity> findByLastActivityEpochMsLessThan(long cutoffEpochMs);
}
