package com.tejaswin.quizplatform.service;

import com.tejaswin.quizplatform.dsa.MaxHeap;
import com.tejaswin.quizplatform.model.LeaderboardEntry;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class LeaderboardService {

    public List<LeaderboardEntry> rank(Map<String, Integer> scores, Map<String, String> names) {
        MaxHeap heap = new MaxHeap();
        for (Map.Entry<String, Integer> entry : scores.entrySet()) {
            heap.insert(new LeaderboardEntry(entry.getKey(), names.getOrDefault(entry.getKey(), "Unknown"), entry.getValue()));
        }

        List<LeaderboardEntry> ranked = new ArrayList<>();
        while (!heap.isEmpty()) {
            ranked.add(heap.extractMax());
        }
        return ranked;
    }
}
