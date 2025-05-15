package com.realdeal.backend.post.controller;

import com.realdeal.backend.post.service.CommentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;   // NEW import
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CommentController.class)
class CommentControllerTest {

    @Autowired private MockMvc mvc;

    @MockitoBean                      // <-- replaces @MockBean
    private CommentService commentService;

    @Test
    void likeComment_endpointWorks() throws Exception {
        UUID id = UUID.randomUUID();
        when(commentService.toggleCommentLike(id, "u")).thenReturn(true);

        mvc.perform(post("/api/comments/{id}/like", id)
                .param("userId", "u"))
            .andExpect(status().isOk());

        verify(commentService).toggleCommentLike(id, "u");
    }
}
