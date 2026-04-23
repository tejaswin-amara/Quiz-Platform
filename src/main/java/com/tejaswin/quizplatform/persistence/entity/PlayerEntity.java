package com.tejaswin.quizplatform.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "players")
public class PlayerEntity {
    @Id
    @Column(length = 64)
    private String participantId;

    @Column(nullable = false, length = 16)
    private String sessionId;

    @Column(nullable = false)
    private String participantName;

    @Column(nullable = false)
    private Integer score;

    @Column(nullable = false, length = 4000)
    private String scoreHistoryCsv;

    public String getParticipantId() {
        return participantId;
    }

    public void setParticipantId(String participantId) {
        this.participantId = participantId;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getParticipantName() {
        return participantName;
    }

    public void setParticipantName(String participantName) {
        this.participantName = participantName;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public String getScoreHistoryCsv() {
        return scoreHistoryCsv;
    }

    public void setScoreHistoryCsv(String scoreHistoryCsv) {
        this.scoreHistoryCsv = scoreHistoryCsv;
    }
}
