package com.tejaswin.quizplatform.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:quiz-platform-api;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class SessionControllerApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String registerAndGetToken(String email, String role) throws Exception {
        String payload = """
                {
                  "name":"Test User",
                  "email":"%s",
                  "password":"passw0rd123",
                  "role":"%s"
                }
                """.formatted(email, role);
        String response = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).get("accessToken").asText();
    }

    @Test
    void shouldExposeSessionFlowApis() throws Exception {
        String hostToken = registerAndGetToken("host-api@test.com", "HOST");
        String playerToken = registerAndGetToken("player-api@test.com", "USER");

        String createResponse = mockMvc.perform(post("/session/create")
                        .header("Authorization", "Bearer " + hostToken)
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
                        .header("Authorization", "Bearer " + playerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"sessionId\":\"" + sessionId + "\",\"participantName\":\"Tester\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.participantId").exists())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String participantId = objectMapper.readTree(joinResponse).get("participantId").asText();

        mockMvc.perform(get("/session/{id}/question", sessionId)
                        .header("Authorization", "Bearer " + hostToken)
                        .param("start", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.state").value("LIVE"))
                .andExpect(jsonPath("$.question.id").exists());

        mockMvc.perform(post("/session/{id}/answer", sessionId)
                        .header("Authorization", "Bearer " + playerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"participantId\":\"" + participantId + "\",\"answerOption\":1}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score").exists());

        mockMvc.perform(get("/session/{id}/leaderboard", sessionId)
                        .header("Authorization", "Bearer " + hostToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/session/{id}/results", sessionId)
                        .header("Authorization", "Bearer " + hostToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.leaderboard").isArray())
                .andExpect(jsonPath("$.averageScore").exists())
                .andExpect(jsonPath("$.lisPerformanceTrend").exists());
    }

    @Test
    void shouldReturnBadRequestForInvalidSessionAndValidationFailures() throws Exception {
        String token = registerAndGetToken("host-invalid@test.com", "HOST");
        mockMvc.perform(post("/session/join")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"sessionId\":\"SABC12345\",\"participantName\":\"Tester\"}"))
                .andExpect(status().isNotFound());

        mockMvc.perform(post("/session/create")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"\",\"questionIds\":[],\"questionDurationSeconds\":2}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldStartDemoSessionWithPlayersInSingleCall() throws Exception {
        String token = registerAndGetToken("host-demo@test.com", "HOST");
        mockMvc.perform(get("/demo/start"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/demo/start")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessionId").exists())
                .andExpect(jsonPath("$.playerCount").value(4))
                .andExpect(jsonPath("$.players").isArray());
    }
}
