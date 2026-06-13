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
    @Test
    void shouldReturn401Or403ForUnauthenticatedProtectedEndpoints() throws Exception {
        // Unguarded: unauthenticated access to a session endpoint must never return 200.
        // Spring Security's default for anonymous + stateless returns 403.
        mockMvc.perform(get("/session/SFAKE001/question"))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldAllowUserRoleToDemoAfterSecurityConfigChange() throws Exception {
        // BUG-1 fix: /demo/start changed from hasAnyRole(HOST,ADMIN) to authenticated()
        // so USER-role accounts must now be able to start a demo session.
        String userToken = registerAndGetToken("user-demo-guard@test.com", "USER");

        mockMvc.perform(get("/demo/start")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessionId").exists())
                .andExpect(jsonPath("$.playerCount").value(4));
    }

}
