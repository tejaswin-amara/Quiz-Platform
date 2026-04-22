package com.tejaswin.quizplatform.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "questions")
public class QuestionEntity {
    @Id
    private Long id;

    @Column(nullable = false)
    private String text;

    @Column(nullable = false, length = 2000)
    private String optionsSerialized;

    @Column(nullable = false)
    private Integer correctOption;

    @Column(nullable = false)
    private String topic;

    @Column(nullable = false)
    private Integer difficulty;

    @Column(nullable = false)
    private Integer weight;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getOptionsSerialized() {
        return optionsSerialized;
    }

    public void setOptionsSerialized(String optionsSerialized) {
        this.optionsSerialized = optionsSerialized;
    }

    public Integer getCorrectOption() {
        return correctOption;
    }

    public void setCorrectOption(Integer correctOption) {
        this.correctOption = correctOption;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public Integer getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Integer difficulty) {
        this.difficulty = difficulty;
    }

    public Integer getWeight() {
        return weight;
    }

    public void setWeight(Integer weight) {
        this.weight = weight;
    }
}
