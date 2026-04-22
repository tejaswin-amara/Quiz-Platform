package com.tejaswin.quizplatform.dsa;

import com.tejaswin.quizplatform.model.Question;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class DynamicProgrammingUtils {
    private DynamicProgrammingUtils() {
    }

    public static List<Question> knapsackSelect(List<Question> questions, int maxWeight) {
        int n = questions.size();
        int[][] dp = new int[n + 1][maxWeight + 1];

        for (int i = 1; i <= n; i++) {
            int weight = questions.get(i - 1).weight();
            int value = questions.get(i - 1).difficulty() * 10;
            for (int w = 0; w <= maxWeight; w++) {
                dp[i][w] = dp[i - 1][w];
                if (weight <= w) {
                    dp[i][w] = Math.max(dp[i][w], value + dp[i - 1][w - weight]);
                }
            }
        }

        List<Question> selected = new ArrayList<>();
        int w = maxWeight;
        for (int i = n; i > 0; i--) {
            if (dp[i][w] != dp[i - 1][w]) {
                Question picked = questions.get(i - 1);
                selected.add(picked);
                w -= picked.weight();
            }
        }
        Collections.reverse(selected);
        return selected;
    }

    public static int longestIncreasingSubsequence(List<Integer> values) {
        if (values.isEmpty()) {
            return 0;
        }
        int[] dp = new int[values.size()];
        int maxLength = 1;
        for (int i = 0; i < values.size(); i++) {
            dp[i] = 1;
            for (int j = 0; j < i; j++) {
                if (values.get(i) > values.get(j)) {
                    dp[i] = Math.max(dp[i], dp[j] + 1);
                }
            }
            maxLength = Math.max(maxLength, dp[i]);
        }
        return maxLength;
    }
}
