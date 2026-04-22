package com.tejaswin.quizplatform.persistence.repository;

import com.tejaswin.quizplatform.persistence.entity.QuestionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionRepository extends JpaRepository<QuestionEntity, Long> {
}
