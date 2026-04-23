package com.tejaswin.quizplatform.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "sessions")
public class SessionEntity {
    @Id
    @Column(length = 16)
    private String sessionId;

    @Column(nullable = false, length = 16)
    private String quizCode;

    @Column(nullable = false, length = 16)
    private String state;

    @Column(nullable = false)
    private Integer questionDurationSeconds;

    private Long startEpochMs;

    @Column(nullable = false)
    private Long lastActivityEpochMs;

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getQuizCode() {
        return quizCode;
    }

    public void setQuizCode(String quizCode) {
        this.quizCode = quizCode;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public Integer getQuestionDurationSeconds() {
        return questionDurationSeconds;
    }

    public void setQuestionDurationSeconds(Integer questionDurationSeconds) {
        this.questionDurationSeconds = questionDurationSeconds;
    }

    public Long getStartEpochMs() {
        return startEpochMs;
    }

    public void setStartEpochMs(Long startEpochMs) {
        this.startEpochMs = startEpochMs;
    }

    public Long getLastActivityEpochMs() {
        return lastActivityEpochMs;
    }

    public void setLastActivityEpochMs(Long lastActivityEpochMs) {
        this.lastActivityEpochMs = lastActivityEpochMs;
    }
}
