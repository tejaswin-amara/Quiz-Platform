package com.tejaswin.quizplatform.controller;

import com.tejaswin.quizplatform.dto.CreateSessionRequest;
import com.tejaswin.quizplatform.dto.JoinSessionRequest;
import com.tejaswin.quizplatform.dto.SessionAnswerRequest;
import com.tejaswin.quizplatform.service.QuizPlatformService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/session")
public class SessionController {
    private final QuizPlatformService service;

    public SessionController(QuizPlatformService service) {
        this.service = service;
    }

    @PostMapping("/create")
    public Object createSession(@RequestBody CreateSessionRequest request) {
        return service.createSession(request.title(), request.questionIds(), request.questionDurationSeconds());
    }

    @PostMapping("/join")
    public Object joinSession(
            @RequestParam String sessionId,
            @RequestBody JoinSessionRequest request
    ) {
        return service.joinSession(sessionId, request.participantName());
    }

    @GetMapping("/{id}/question")
    public Object currentQuestion(
            @PathVariable("id") String sessionId,
            @RequestParam(defaultValue = "false") boolean start
    ) {
        return service.getSessionQuestion(sessionId, start);
    }

    @PostMapping("/{id}/answer")
    public Object submitAnswer(@PathVariable("id") String sessionId, @RequestBody SessionAnswerRequest request) {
        return service.submitSessionAnswer(sessionId, request.participantId(), request.answerOption());
    }

    @GetMapping("/{id}/leaderboard")
    public Object leaderboard(@PathVariable("id") String sessionId) {
        return service.sessionLeaderboard(sessionId);
    }

    @GetMapping("/{id}/results")
    public Object results(@PathVariable("id") String sessionId) {
        return service.sessionResults(sessionId);
    }
}
