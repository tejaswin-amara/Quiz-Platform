package com.tejaswin.quizplatform.dsa;

import com.tejaswin.quizplatform.model.Question;

import java.util.ArrayList;
import java.util.List;

public class QuestionBST {
    private Node root;

    public void insert(Question question) {
        root = insert(root, question);
    }

    public Question search(long id) {
        Node node = search(root, id);
        return node == null ? null : node.question;
    }

    public void delete(long id) {
        root = delete(root, id);
    }

    public List<Question> inorderTraversal() {
        List<Question> ordered = new ArrayList<>();
        inorder(root, ordered);
        return ordered;
    }

    private Node insert(Node node, Question question) {
        if (node == null) {
            return new Node(question);
        }
        if (question.id() < node.question.id()) {
            node.left = insert(node.left, question);
        } else if (question.id() > node.question.id()) {
            node.right = insert(node.right, question);
        } else {
            node.question = question;
        }
        return node;
    }

    private Node search(Node node, long id) {
        if (node == null || node.question.id() == id) {
            return node;
        }
        return id < node.question.id() ? search(node.left, id) : search(node.right, id);
    }

    private Node delete(Node node, long id) {
        if (node == null) {
            return null;
        }
        if (id < node.question.id()) {
            node.left = delete(node.left, id);
        } else if (id > node.question.id()) {
            node.right = delete(node.right, id);
        } else {
            if (node.left == null) {
                return node.right;
            }
            if (node.right == null) {
                return node.left;
            }
            Node successor = minValueNode(node.right);
            node.question = successor.question;
            node.right = delete(node.right, successor.question.id());
        }
        return node;
    }

    private Node minValueNode(Node node) {
        Node current = node;
        while (current.left != null) {
            current = current.left;
        }
        return current;
    }

    private void inorder(Node node, List<Question> ordered) {
        if (node == null) {
            return;
        }
        inorder(node.left, ordered);
        ordered.add(node.question);
        inorder(node.right, ordered);
    }

    private static class Node {
        private Question question;
        private Node left;
        private Node right;

        private Node(Question question) {
            this.question = question;
        }
    }
}
