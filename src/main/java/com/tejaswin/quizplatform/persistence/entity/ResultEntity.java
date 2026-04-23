package com.tejaswin.quizplatform.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;

@Entity
@Table(
        name = "results",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_result_submission", columnNames = {"sessionId", "participantId", "questionIndex"})
        }
)
public class ResultEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 16)
    private String sessionId;

    @Column(nullable = false, length = 64)
    private String participantId;

    @Column(nullable = false)
    private Integer questionIndex;

    @Column(nullable = false)
    private Long questionId;

    @Column(nullable = false)
    private Boolean correct;

    @Column(nullable = false)
    private Integer scoreAfterAnswer;

    @Column(nullable = false)
    private Instant submittedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getParticipantId() {
        return participantId;
    }

    public void setParticipantId(String participantId) {
        this.participantId = participantId;
    }

    public Integer getQuestionIndex() {
        return questionIndex;
    }

    public void setQuestionIndex(Integer questionIndex) {
        this.questionIndex = questionIndex;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public Boolean getCorrect() {
        return correct;
    }

    public void setCorrect(Boolean correct) {
        this.correct = correct;
    }

    public Integer getScoreAfterAnswer() {
        return scoreAfterAnswer;
    }

    public void setScoreAfterAnswer(Integer scoreAfterAnswer) {
        this.scoreAfterAnswer = scoreAfterAnswer;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(Instant submittedAt) {
        this.submittedAt = submittedAt;
    }
}
