package com.tejaswin.quizplatform.controller;

import com.tejaswin.quizplatform.dto.CreateQuestionRequest;
import com.tejaswin.quizplatform.dto.CreateQuizRequest;
import com.tejaswin.quizplatform.dto.JoinQuizRequest;
import com.tejaswin.quizplatform.dto.SubmitQuizRequest;
import com.tejaswin.quizplatform.model.Question;
import com.tejaswin.quizplatform.service.QuizPlatformService;
import jakarta.validation.Valid;
import jakarta.annotation.PostConstruct;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class QuizController {
    private final QuizPlatformService service;

    public QuizController(QuizPlatformService service) {
        this.service = service;
    }

    @PostConstruct
    void seedData() {
        service.seedQuestionsIfEmpty();
    }

    @PostMapping("/questions")
    public Question createQuestion(@Valid @RequestBody CreateQuestionRequest request) {
        return service.addQuestion(new Question(
                request.id(),
                request.text(),
                request.options(),
                request.correctOption(),
                request.topic(),
                request.difficulty(),
                request.weight()
        ));
    }

    @DeleteMapping("/questions/{id}")
    public Map<String, String> deleteQuestion(@PathVariable long id) {
        service.deleteQuestion(id);
        return Map.of("status", "deleted");
    }

    @GetMapping("/questions")
    public Object allQuestions() {
        return service.allQuestionsInOrder();
    }

    @PostMapping("/quizzes")
    public Object createQuiz(@Valid @RequestBody CreateQuizRequest request) {
        return service.createQuiz(request.title(), request.questionIds());
    }

    @GetMapping("/quizzes/{code}/questions")
    public Object quizQuestions(@PathVariable String code) {
        return service.getQuizQuestions(code);
    }

    @PostMapping("/quizzes/{code}/join")
    public Object joinQuiz(@PathVariable String code, @Valid @RequestBody JoinQuizRequest request) {
        return service.joinQuiz(code, request.participantName());
    }

    @PostMapping("/quizzes/{code}/submit")
    public Object submitQuiz(@PathVariable String code, @Valid @RequestBody SubmitQuizRequest request) {
        return service.submitAnswers(code, request.participantId(), request.answers());
    }

    @GetMapping("/quizzes/{code}/leaderboard")
    public Object leaderboard(@PathVariable String code) {
        return service.leaderboard(code);
    }

    @GetMapping("/quizzes/{code}/analytics")
    public Object analytics(
            @PathVariable String code,
            @RequestParam(defaultValue = "0") int left,
            @RequestParam(defaultValue = "0") int right,
            @RequestParam String participantId
    ) {
        return service.analytics(code, left, right, participantId);
    }

    @GetMapping("/recommendations")
    public Object recommendations(
            @RequestParam String topic,
            @RequestParam(defaultValue = "bfs") String mode
    ) {
        return Map.of(
                "topic", topic,
                "mode", mode,
                "recommendations", service.recommendTopics(topic, mode),
                "complexity", "BFS/DFS/Topological Sort: O(V + E)"
        );
    }

    @PostMapping("/quizzes/{code}/optimize")
    public Object optimizeQuiz(@PathVariable String code, @RequestParam(defaultValue = "6") int maxWeight) {
        return service.optimizeQuiz(code, maxWeight);
    }

    @GetMapping("/complexities")
    public Object complexities() {
        return service.dsaComplexityMap();
    }
}
