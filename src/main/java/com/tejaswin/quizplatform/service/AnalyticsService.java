package com.tejaswin.quizplatform.service;

import com.tejaswin.quizplatform.dsa.DynamicProgrammingUtils;
import com.tejaswin.quizplatform.dsa.SegmentTree;
import com.tejaswin.quizplatform.model.LeaderboardEntry;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    public Map<String, Object> quizAnalytics(List<LeaderboardEntry> leaderboard, List<Integer> history, int left, int right) {
        int[] scores = leaderboard.stream().mapToInt(LeaderboardEntry::score).toArray();
        if (scores.length == 0) {
            return new LinkedHashMap<>(Map.of(
                    "rangeScoreSum", 0,
                    "lisPerformanceTrend", DynamicProgrammingUtils.longestIncreasingSubsequence(history),
                    "complexity", Map.of("segmentTreeQuery", "O(log n)", "lis", "O(n^2)")
            ));
        }

        int clampedLeft = Math.max(0, Math.min(left, scores.length - 1));
        int clampedRight = Math.max(clampedLeft, Math.min(right, scores.length - 1));
        SegmentTree segmentTree = new SegmentTree(scores);
        int rangeSum = segmentTree.rangeQuery(clampedLeft, clampedRight);

        return new LinkedHashMap<>(Map.of(
                "rangeScoreSum", rangeSum,
                "lisPerformanceTrend", DynamicProgrammingUtils.longestIncreasingSubsequence(history),
                "complexity", Map.of("segmentTreeQuery", "O(log n)", "lis", "O(n^2)")
        ));
    }

    public int totalScoreRange(List<LeaderboardEntry> leaderboard) {
        int[] scores = leaderboard.stream().mapToInt(LeaderboardEntry::score).toArray();
        if (scores.length == 0) {
            return 0;
        }
        SegmentTree segmentTree = new SegmentTree(scores);
        return segmentTree.rangeQuery(0, scores.length - 1);
    }

    public int lisTrend(List<Integer> scores) {
        return DynamicProgrammingUtils.longestIncreasingSubsequence(scores);
    }
}
