package com.tejaswin.quizplatform.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "quizzes")
public class QuizEntity {
    @Id
    @Column(length = 16)
    private String code;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String questionIdsCsv;

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getQuestionIdsCsv() {
        return questionIdsCsv;
    }

    public void setQuestionIdsCsv(String questionIdsCsv) {
        this.questionIdsCsv = questionIdsCsv;
    }
}
