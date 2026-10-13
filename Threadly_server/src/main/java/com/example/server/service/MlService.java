package com.example.server.service;

import com.example.server.model.Thread;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class MlService {

    private final RestClient client;

    public MlService(@Value("${app.ml.url:http://localhost:5000}") String url) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(2));
        factory.setReadTimeout(Duration.ofSeconds(10));
        this.client = RestClient.builder().baseUrl(url).requestFactory(factory).build();
    }

    public static String listingText(Thread t) {
        StringBuilder sb = new StringBuilder();
        if (t.getTitle() != null) sb.append(t.getTitle()).append(". ");
        if (t.getCategory() != null) sb.append(t.getCategory()).append(". ");
        if (t.getThreadText() != null) sb.append(t.getThreadText());
        return sb.toString().trim();
    }

    public Double scoreRisk(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }
        try {
            Map<?, ?> res = client.post()
                    .uri("/risk")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("text", text))
                    .retrieve()
                    .body(Map.class);
            return ((Number) res.get("score")).doubleValue();
        } catch (Exception e) {
            log.warn("ML service unavailable, listing not scored: {}", e.getMessage());
            return null;
        }
    }

    public List<Long> recommend(List<String> liked, List<Thread> candidates, int top) {
        if (liked.isEmpty() || candidates.isEmpty()) {
            return List.of();
        }
        try {
            List<Map<String, Object>> cands = candidates.stream()
                    .map(t -> Map.<String, Object>of("id", t.getThreadId(), "text", listingText(t)))
                    .toList();
            Map<String, Object> body = Map.of("liked", liked, "candidates", cands, "top", top);

            Map<?, ?> res = client.post()
                    .uri("/recommend")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            List<Long> ids = new ArrayList<>();
            for (Object o : (List<?>) res.get("results")) {
                ids.add(((Number) ((Map<?, ?>) o).get("id")).longValue());
            }
            return ids;
        } catch (Exception e) {
            log.warn("ML service unavailable, no recommendations: {}", e.getMessage());
            return List.of();
        }
    }
}