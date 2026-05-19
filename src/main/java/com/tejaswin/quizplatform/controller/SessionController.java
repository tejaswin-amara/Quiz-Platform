package com.tejaswin.quizplatform.controller;

import com.tejaswin.quizplatform.dto.CreateSessionRequest;
import com.tejaswin.quizplatform.dto.JoinSessionRequest;
import com.tejaswin.quizplatform.dto.SessionAnswerRequest;
import com.tejaswin.quizplatform.security.AuthContext;
import com.tejaswin.quizplatform.service.SessionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/session")
public class SessionController {
    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @PostMapping("/create")
    public Object createSession(@Valid @RequestBody CreateSessionRequest request) {
        return sessionService.createSession(AuthContext.requireUser().userId(), request.title(), request.questionIds(), request.questionDurationSeconds());
    }

    @PostMapping("/join")
    public Object joinSession(@Valid @RequestBody JoinSessionRequest request) {
        return sessionService.joinSession(request.sessionId(), request.participantName(), AuthContext.requireUser().userId());
    }

    @GetMapping("/{id}/question")
    public Object currentQuestion(
            @PathVariable("id") @Pattern(regexp = "^S[A-Z0-9]{8}$", message = "sessionId format is invalid") String sessionId,
            @RequestParam(defaultValue = "false") boolean start
    ) {
        return sessionService.getSessionQuestion(sessionId, start, AuthContext.requireUser().userId());
    }

    @PostMapping("/{id}/answer")
    public Object submitAnswer(
            @PathVariable("id") @Pattern(regexp = "^S[A-Z0-9]{8}$", message = "sessionId format is invalid") String sessionId,
            @Valid @RequestBody SessionAnswerRequest request
    ) {
        return sessionService.submitSessionAnswer(sessionId, request.participantId(), request.answerOption(), AuthContext.requireUser().userId());
    }

    @GetMapping("/{id}/leaderboard")
    public Object leaderboard(
            @PathVariable("id") @Pattern(regexp = "^S[A-Z0-9]{8}$", message = "sessionId format is invalid") String sessionId
    ) {
        return sessionService.sessionLeaderboard(sessionId);
    }

    @GetMapping("/{id}/results")
    public Object results(
            @PathVariable("id") @Pattern(regexp = "^S[A-Z0-9]{8}$", message = "sessionId format is invalid") String sessionId
    ) {
        return sessionService.sessionResults(sessionId);
    }

    @PostMapping("/{id}/pause")
    public Object pause(@PathVariable("id") @Pattern(regexp = "^S[A-Z0-9]{8}$", message = "sessionId format is invalid") String sessionId) {
        return sessionService.pauseSession(sessionId, AuthContext.requireUser().userId());
    }

    @PostMapping("/{id}/resume")
    public Object resume(@PathVariable("id") @Pattern(regexp = "^S[A-Z0-9]{8}$", message = "sessionId format is invalid") String sessionId) {
        return sessionService.resumeSession(sessionId, AuthContext.requireUser().userId());
    }

    @PostMapping("/{id}/end")
    public Object end(@PathVariable("id") @Pattern(regexp = "^S[A-Z0-9]{8}$", message = "sessionId format is invalid") String sessionId) {
        return sessionService.endSession(sessionId, AuthContext.requireUser().userId());
    }

    @PostMapping("/{id}/close-lobby")
    public Object closeLobby(@PathVariable("id") @Pattern(regexp = "^S[A-Z0-9]{8}$", message = "sessionId format is invalid") String sessionId) {
        return sessionService.closeLobby(sessionId, AuthContext.requireUser().userId());
    }

    @PostMapping("/{id}/force-next")
    public Object forceNext(@PathVariable("id") @Pattern(regexp = "^S[A-Z0-9]{8}$", message = "sessionId format is invalid") String sessionId) {
        return sessionService.forceNextQuestion(sessionId, AuthContext.requireUser().userId());
    }

    @PostMapping("/{id}/participants/{participantId}/remove")
    public Object removeParticipant(
            @PathVariable("id") @Pattern(regexp = "^S[A-Z0-9]{8}$", message = "sessionId format is invalid") String sessionId,
            @PathVariable String participantId
    ) {
        return sessionService.removeParticipant(sessionId, participantId, AuthContext.requireUser().userId());
    }

    @GetMapping("/{id}/answers/review")
    public Object reviewAnswers(
            @PathVariable("id") @Pattern(regexp = "^S[A-Z0-9]{8}$", message = "sessionId format is invalid") String sessionId,
            @RequestParam(defaultValue = "0") int questionIndex
    ) {
        return sessionService.reviewAnswers(sessionId, questionIndex, AuthContext.requireUser().userId());
    }
}
