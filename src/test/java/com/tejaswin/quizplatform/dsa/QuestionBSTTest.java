package com.tejaswin.quizplatform.dsa;

import com.tejaswin.quizplatform.model.Question;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class QuestionBSTTest {

    @Test
    void shouldInsertSearchDeleteAndTraverse() {
        QuestionBST bst = new QuestionBST();
        Question q1 = new Question(2, "Q2", List.of("a", "b"), 0, "Arrays", 1, 1);
        Question q2 = new Question(1, "Q1", List.of("a", "b"), 0, "Graphs", 1, 1);
        Question q3 = new Question(3, "Q3", List.of("a", "b"), 0, "DP", 1, 1);

        bst.insert(q1);
        bst.insert(q2);
        bst.insert(q3);

        assertEquals("Q1", bst.search(1).text());
        assertEquals(List.of(1L, 2L, 3L), bst.inorderTraversal().stream().map(Question::id).toList());

        bst.delete(2);
        assertNull(bst.search(2));
        assertEquals(List.of(1L, 3L), bst.inorderTraversal().stream().map(Question::id).toList());
    }
}
