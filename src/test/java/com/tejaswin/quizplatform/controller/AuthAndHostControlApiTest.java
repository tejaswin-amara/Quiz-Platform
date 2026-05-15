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
        "spring.datasource.url=jdbc:h2:mem:quiz-platform-authz;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class AuthAndHostControlApiTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String registerAndGetToken(String email, String role) throws Exception {
        String payload = """
                {
                  "name":"%s",
                  "email":"%s",
                  "password":"passw0rd123",
                  "role":"%s"
                }
                """.formatted(role + "-user", email, role);
        String response = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode json = objectMapper.readTree(response);
        return json.get("accessToken").asText();
    }

    @Test
    void shouldEnforceRoleProtectionForHostOperations() throws Exception {
        String hostToken = registerAndGetToken("host@test.com", "HOST");
        String userToken = registerAndGetToken("user@test.com", "USER");

        mockMvc.perform(post("/session/create")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Denied\",\"questionIds\":[101],\"questionDurationSeconds\":10}"))
                .andExpect(status().isForbidden());

        String createResponse = mockMvc.perform(post("/session/create")
                        .header("Authorization", "Bearer " + hostToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Allowed\",\"questionIds\":[101,102],\"questionDurationSeconds\":10}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessionId").exists())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String sessionId = objectMapper.readTree(createResponse).get("sessionId").asText();

        mockMvc.perform(post("/session/join")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"sessionId\":\"" + sessionId + "\",\"participantName\":\"UserOne\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/session/{id}/pause", sessionId)
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/session/{id}/question", sessionId)
                        .header("Authorization", "Bearer " + hostToken)
                        .param("start", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.state").value("LIVE"));

        mockMvc.perform(post("/session/{id}/pause", sessionId)
                        .header("Authorization", "Bearer " + hostToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.state").value("PAUSED"));

        mockMvc.perform(post("/session/{id}/resume", sessionId)
                        .header("Authorization", "Bearer " + hostToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.state").value("LIVE"));

        mockMvc.perform(post("/session/{id}/end", sessionId)
                        .header("Authorization", "Bearer " + hostToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.state").value("COMPLETED"));
    }
}
