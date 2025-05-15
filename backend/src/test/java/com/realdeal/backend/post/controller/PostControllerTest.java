package com.realdeal.backend.post.controller;

import com.realdeal.backend.authentication.service.UserProfileService;
import com.realdeal.backend.post.model.Post;
import com.realdeal.backend.post.service.PostService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PostController.class)
class PostControllerTest {

    @Autowired private MockMvc mvc;

    /** Mockito doubles registered in the Spring test context */
    @MockitoBean          // <-- field-level annotation
    private PostService postService;

    @MockitoBean
    private UserProfileService userProfileService;

    @Test
    void getPosts_returnsPagedDtos() throws Exception {
        // arrange
        Post p = new Post();
        p.setUserId("u");
        p.setTitle("t");

        when(postService.getPaginatedPosts(0, 9))
            .thenReturn(new PageImpl<>(List.of(p)));

        when(userProfileService.getUsernamesByUserIds(any()))
            .thenReturn(Map.of("u", "name"));

        // act + assert
        mvc.perform(get("/api/posts/all?page=0&size=9"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[0].title").value("t"));
    }
}
