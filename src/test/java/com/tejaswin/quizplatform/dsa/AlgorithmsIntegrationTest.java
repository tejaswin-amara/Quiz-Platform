package com.tejaswin.quizplatform.dsa;

import com.tejaswin.quizplatform.model.LeaderboardEntry;
import com.tejaswin.quizplatform.model.Question;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AlgorithmsIntegrationTest {

    @Test
    void heapShouldReturnScoresInDescendingOrder() {
        MaxHeap heap = new MaxHeap();
        heap.insert(new LeaderboardEntry("1", "A", 30));
        heap.insert(new LeaderboardEntry("2", "B", 50));
        heap.insert(new LeaderboardEntry("3", "C", 40));

        assertEquals(50, heap.extractMax().score());
        assertEquals(40, heap.extractMax().score());
        assertEquals(30, heap.extractMax().score());
    }

    @Test
    void dpAndSegmentTreeShouldComputeExpectedValues() {
        List<Question> questions = List.of(
                new Question(1, "Q1", List.of("a", "b"), 0, "T1", 5, 5),
                new Question(2, "Q2", List.of("a", "b"), 0, "T2", 3, 3),
                new Question(3, "Q3", List.of("a", "b"), 0, "T3", 4, 2)
        );

        List<Question> selected = DynamicProgrammingUtils.knapsackSelect(questions, 5);
        assertEquals(List.of(2L, 3L), selected.stream().map(Question::id).toList());

        int lis = DynamicProgrammingUtils.longestIncreasingSubsequence(List.of(10, 5, 8, 9));
        assertEquals(3, lis);

        SegmentTree tree = new SegmentTree(new int[]{10, 20, 30, 40});
        assertEquals(50, tree.rangeQuery(1, 2));
    }

    @Test
    void graphShouldSupportBfsDfsAndTopo() {
        TopicGraph graph = new TopicGraph();
        graph.addEdge("A", "B");
        graph.addEdge("A", "C");
        graph.addEdge("B", "D");

        assertEquals(List.of("A", "B", "C", "D"), graph.bfs("A"));
        assertEquals(List.of("A", "B", "D", "C"), graph.dfs("A"));
        assertEquals(4, graph.topologicalSort().size());
    }
}
