package com.tejaswin.quizplatform.dsa;

import com.tejaswin.quizplatform.model.LeaderboardEntry;

import java.util.ArrayList;
import java.util.List;

public class MaxHeap {
    private final List<LeaderboardEntry> heap = new ArrayList<>();

    public void insert(LeaderboardEntry entry) {
        heap.add(entry);
        siftUp(heap.size() - 1);
    }

    public LeaderboardEntry extractMax() {
        if (heap.isEmpty()) {
            return null;
        }
        LeaderboardEntry max = heap.get(0);
        LeaderboardEntry last = heap.remove(heap.size() - 1);
        if (!heap.isEmpty()) {
            heap.set(0, last);
            siftDown(0);
        }
        return max;
    }

    public boolean isEmpty() {
        return heap.isEmpty();
    }

    private void siftUp(int index) {
        while (index > 0) {
            int parent = (index - 1) / 2;
            if (heap.get(parent).score() >= heap.get(index).score()) {
                break;
            }
            swap(parent, index);
            index = parent;
        }
    }

    private void siftDown(int index) {
        int size = heap.size();
        while (true) {
            int left = 2 * index + 1;
            int right = 2 * index + 2;
            int largest = index;

            if (left < size && heap.get(left).score() > heap.get(largest).score()) {
                largest = left;
            }
            if (right < size && heap.get(right).score() > heap.get(largest).score()) {
                largest = right;
            }
            if (largest == index) {
                break;
            }
            swap(index, largest);
            index = largest;
        }
    }

    private void swap(int i, int j) {
        LeaderboardEntry temp = heap.get(i);
        heap.set(i, heap.get(j));
        heap.set(j, temp);
    }
}
