package com.tejaswin.quizplatform.controller;

import com.tejaswin.quizplatform.service.QuizPlatformService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dsa")
public class DsaController {
    private final QuizPlatformService quizPlatformService;

    public DsaController(QuizPlatformService quizPlatformService) {
        this.quizPlatformService = quizPlatformService;
    }

    @GetMapping("/insights")
    public Object insights() {
        return quizPlatformService.dsaInsights();
    }
}
