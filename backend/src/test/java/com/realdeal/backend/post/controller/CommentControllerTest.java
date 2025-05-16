package com.realdeal.backend.post.controller;

import com.realdeal.backend.authentication.service.UserProfileService;
import com.realdeal.backend.exp.config.DailyExpFilter;
import com.realdeal.backend.post.model.Comment;
import com.realdeal.backend.post.model.Post;
import com.realdeal.backend.post.repository.CommentRepository;
import com.realdeal.backend.post.service.CommentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.domain.PageImpl;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for {@link CommentController}.
 */
@WebMvcTest(
    controllers = CommentController.class,
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = DailyExpFilter.class
    )
)
class CommentControllerTest {

    @Autowired private MockMvc mvc;

    @MockitoBean private CommentService     commentService;
    @MockitoBean private UserProfileService userProfileService;
    @MockitoBean private CommentRepository  commentRepository;

    /* -------- helpers -------- */
    private Comment mockComment(UUID postId) {
        Comment c = new Comment();
        c.setId(UUID.randomUUID());
        c.setUserId("u1");
        c.setContent("Nice post!");
        Post p = new Post(); p.setId(postId);
        c.setPost(p);
        return c;
    }

    /* -------- tests -------- */

    /** Happy-path comment creation. */
    @Test
    void createComment_returnsCreatedDto() throws Exception {
        UUID postId = UUID.randomUUID();
        Comment c   = mockComment(postId);

        when(commentService.addComment(eq(postId), eq("u1"), eq("Nice post!"), isNull()))
            .thenReturn(c);
        when(userProfileService.getUsernameByUserId("u1"))
            .thenReturn("mockUser");

        mvc.perform(post("/api/comments/create")
                .param("postId",  postId.toString())
                .param("userId",  "u1")
                .param("content", "Nice post!"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.content").value("Nice post!"))
            .andExpect(jsonPath("$.username").value("mockUser"));
    }

    /** Paginated top-level comments for a post. */
    @Test
    void getPostComments_returnsPagedDtos() throws Exception {
        UUID postId = UUID.randomUUID();
        Comment c   = mockComment(postId);

        when(commentService.getTopLevelComments(postId, 0, 10))
            .thenReturn(new PageImpl<>(List.of(c)));
        when(userProfileService.getUsernamesByUserIds(any()))
            .thenReturn(Map.of("u1", "mockUser"));
        when(commentService.hasLikedComment(any(), any()))
            .thenReturn(false);               // like status isn’t relevant here

        mvc.perform(get("/api/comments/post/{postId}?page=0&size=10", postId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[0].content").value("Nice post!"))
            .andExpect(jsonPath("$.content[0].username").value("mockUser"));
    }
}
