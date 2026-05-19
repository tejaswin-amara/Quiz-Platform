package com.tejaswin.quizplatform.observability;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;
import java.util.regex.Pattern;

@Component
public class RequestObservabilityFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(RequestObservabilityFilter.class);
    private static final String REQUEST_ID_HEADER = "X-Request-Id";
    private static final String REQUEST_ID_KEY = "requestId";
    private static final Pattern SAFE_REQUEST_ID = Pattern.compile("^[A-Za-z0-9._\\-]{1,128}$");

    private final long slowRequestThresholdMs;

    public RequestObservabilityFilter(@Value("${observability.slow-request-threshold-ms:1000}") long slowRequestThresholdMs) {
        this.slowRequestThresholdMs = slowRequestThresholdMs;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String requestId = resolveRequestId(request.getHeader(REQUEST_ID_HEADER));
        long startNs = System.nanoTime();
        MDC.put(REQUEST_ID_KEY, requestId);
        response.setHeader(REQUEST_ID_HEADER, requestId);
        try {
            filterChain.doFilter(request, response);
        } finally {
            long durationMs = (System.nanoTime() - startNs) / 1_000_000L;
            String method = request.getMethod();
            String uri = request.getRequestURI();
            int status = response.getStatus();
            if (durationMs >= slowRequestThresholdMs) {
                log.warn("event=http_request_slow method={} uri={} status={} durationMs={}", method, uri, status, durationMs);
            } else {
                log.info("event=http_request method={} uri={} status={} durationMs={}", method, uri, status, durationMs);
            }
            MDC.remove(REQUEST_ID_KEY);
        }
    }

    private String resolveRequestId(String requestIdHeader) {
        if (requestIdHeader == null || requestIdHeader.isBlank()) {
            return UUID.randomUUID().toString();
        }
        String cleaned = requestIdHeader.trim();
        if (SAFE_REQUEST_ID.matcher(cleaned).matches()) {
            return cleaned;
        }
        return UUID.randomUUID().toString();
    }
}
