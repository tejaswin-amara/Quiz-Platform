package com.tejaswin.quizplatform.controller;

import com.tejaswin.quizplatform.service.SessionService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/demo")
public class DemoController {
    private final SessionService sessionService;

    public DemoController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping("/start")
    public Object startDemo() {
        return sessionService.startDemoSession();
    }
}
