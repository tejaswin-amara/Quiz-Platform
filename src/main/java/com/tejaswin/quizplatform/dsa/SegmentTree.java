package com.tejaswin.quizplatform.dsa;

public class SegmentTree {
    private final int[] tree;
    private final int n;

    public SegmentTree(int[] arr) {
        this.n = arr.length;
        this.tree = new int[Math.max(1, 4 * Math.max(1, n))];
        if (n > 0) {
            build(arr, 1, 0, n - 1);
        }
    }

    public int rangeQuery(int left, int right) {
        if (n == 0) {
            return 0;
        }
        left = Math.max(0, left);
        right = Math.min(n - 1, right);
        if (left > right) {
            return 0;
        }
        return rangeQuery(1, 0, n - 1, left, right);
    }

    private void build(int[] arr, int node, int start, int end) {
        if (start == end) {
            tree[node] = arr[start];
            return;
        }
        int mid = (start + end) / 2;
        build(arr, 2 * node, start, mid);
        build(arr, 2 * node + 1, mid + 1, end);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }

    private int rangeQuery(int node, int start, int end, int left, int right) {
        if (right < start || end < left) {
            return 0;
        }
        if (left <= start && end <= right) {
            return tree[node];
        }
        int mid = (start + end) / 2;
        int p1 = rangeQuery(2 * node, start, mid, left, right);
        int p2 = rangeQuery(2 * node + 1, mid + 1, end, left, right);
        return p1 + p2;
    }
}
