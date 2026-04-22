package com.tejaswin.quizplatform.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SessionControllerApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldExposeSessionFlowApis() throws Exception {
        String createResponse = mockMvc.perform(post("/session/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"API Live\",\"questionIds\":[101,102],\"questionDurationSeconds\":12}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessionId").exists())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode createJson = objectMapper.readTree(createResponse);
        String sessionId = createJson.get("sessionId").asText();

        String joinResponse = mockMvc.perform(post("/session/join")
                        .param("sessionId", sessionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"participantName\":\"Tester\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.participantId").exists())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String participantId = objectMapper.readTree(joinResponse).get("participantId").asText();

        mockMvc.perform(get("/session/{id}/question", sessionId)
                        .param("start", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.state").value("LIVE"))
                .andExpect(jsonPath("$.question.id").exists());

        mockMvc.perform(post("/session/{id}/answer", sessionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"participantId\":\"" + participantId + "\",\"answerOption\":1}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score").exists());

        mockMvc.perform(get("/session/{id}/leaderboard", sessionId))
                .andExpect(status().isOk());

        mockMvc.perform(get("/session/{id}/results", sessionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.leaderboard").isArray())
                .andExpect(jsonPath("$.lisPerformanceTrend").exists());
    }
}
