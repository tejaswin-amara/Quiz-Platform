package com.tejaswin.quizplatform.dsa;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.Set;

public class TopicGraph {
    private final Map<String, List<String>> adjacency = new HashMap<>();

    public void addTopic(String topic) {
        adjacency.putIfAbsent(topic, new ArrayList<>());
    }

    public void addEdge(String from, String to) {
        addTopic(from);
        addTopic(to);
        adjacency.get(from).add(to);
    }

    public List<String> bfs(String start) {
        List<String> order = new ArrayList<>();
        if (!adjacency.containsKey(start)) {
            return order;
        }
        Queue<String> queue = new ArrayDeque<>();
        Set<String> visited = new HashSet<>();
        queue.offer(start);
        visited.add(start);

        while (!queue.isEmpty()) {
            String node = queue.poll();
            order.add(node);
            for (String neighbor : adjacency.getOrDefault(node, List.of())) {
                if (visited.add(neighbor)) {
                    queue.offer(neighbor);
                }
            }
        }
        return order;
    }

    public List<String> dfs(String start) {
        List<String> order = new ArrayList<>();
        if (!adjacency.containsKey(start)) {
            return order;
        }
        Set<String> visited = new HashSet<>();
        dfsRecursive(start, visited, order);
        return order;
    }

    public List<String> topologicalSort() {
        Map<String, Integer> indegree = new HashMap<>();
        for (String node : adjacency.keySet()) {
            indegree.putIfAbsent(node, 0);
            for (String neighbor : adjacency.get(node)) {
                indegree.put(neighbor, indegree.getOrDefault(neighbor, 0) + 1);
            }
        }

        Queue<String> queue = new LinkedList<>();
        for (Map.Entry<String, Integer> entry : indegree.entrySet()) {
            if (entry.getValue() == 0) {
                queue.offer(entry.getKey());
            }
        }

        List<String> order = new ArrayList<>();
        while (!queue.isEmpty()) {
            String node = queue.poll();
            order.add(node);
            for (String neighbor : adjacency.getOrDefault(node, List.of())) {
                indegree.put(neighbor, indegree.get(neighbor) - 1);
                if (indegree.get(neighbor) == 0) {
                    queue.offer(neighbor);
                }
            }
        }
        return order;
    }

    private void dfsRecursive(String node, Set<String> visited, List<String> order) {
        visited.add(node);
        order.add(node);
        for (String neighbor : adjacency.getOrDefault(node, List.of())) {
            if (!visited.contains(neighbor)) {
                dfsRecursive(neighbor, visited, order);
            }
        }
    }
}
