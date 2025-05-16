package com.realdeal.backend.post.controller;

import com.realdeal.backend.authentication.service.UserProfileService;
import com.realdeal.backend.exp.config.DailyExpFilter;
import com.realdeal.backend.exp.service.ExperienceService;
import com.realdeal.backend.genre.service.GenreService;
import com.realdeal.backend.post.model.Post;
import com.realdeal.backend.post.model.PostImage;
import com.realdeal.backend.post.repository.PostRepository;
import com.realdeal.backend.post.service.PostService;
import com.realdeal.backend.post.service.ReactionService;
import com.realdeal.backend.recommendation.service.RecommendationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = PostController.class,
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = DailyExpFilter.class
    )
)
class PostControllerTest {

    @Autowired private MockMvc mvc;

    /* mocked collaborators */
    @MockitoBean private PostService postService;
    @MockitoBean private UserProfileService userProfileService;
    @MockitoBean private ReactionService reactionService;
    @MockitoBean private PostRepository postRepository;
    @MockitoBean private GenreService genreService;
    @MockitoBean private RecommendationService recommendationService;
    @MockitoBean private ExperienceService experienceService;

    /* ---------- helpers ---------- */

    /** Build a fully-populated Post object for reuse in tests */
    private Post mockPost() {
        Post p = new Post();
        p.setId(UUID.randomUUID());
        p.setUserId("u123");
        p.setTitle("Mock Title");
        p.setContent("Mock content");
        p.setCreatedAt(LocalDateTime.now());

        PostImage img = new PostImage();
        img.setId(UUID.randomUUID());
        img.setPosition(0);
        img.setUrl("https://example.com/img.jpg");

        p.setImages(List.of(img));
        return p;
    }

    /* ---------- tests ---------- */

    @Test
    void getPosts_returnsPagedDtos() throws Exception {
        Post p = new Post();
        p.setUserId("u123");
        p.setTitle("t");

        when(postService.getPaginatedPosts(0, 9))
            .thenReturn(new PageImpl<>(List.of(p)));

        // batch lookup used earlier in the pipeline
        when(userProfileService.getUsernamesByUserIds(any()))
            .thenReturn(Map.of("u123", "name"));

        // ← this is the missing stub
        when(userProfileService.getUsernameByUserId("u123"))
            .thenReturn("name");

        mvc.perform(get("/api/posts/all?page=0&size=9"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[0].title").value("t"))
            .andExpect(jsonPath("$.content[0].username").value("name"));
    }


    @Test
    void createPost_returnsCreatedDto() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
            "images",                           // part name
            "photo.jpg",                        // original filename
            MediaType.IMAGE_JPEG_VALUE,
            "dummy image bytes".getBytes()
        );

        Post saved = mockPost();

        when(postService.createPost(eq("u123"), eq("Mock Title"), eq("Mock content"), anyList()))
            .thenReturn(saved);
        when(userProfileService.getUsernameByUserId("u123"))
            .thenReturn("mockUser");

        mvc.perform(multipart("/api/posts/create")
                .file(file)
                .param("userId", "u123")
                .param("title", "Mock Title")
                .param("content", "Mock content"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.title").value("Mock Title"))
            .andExpect(jsonPath("$.username").value("mockUser"))
            .andExpect(jsonPath("$.images[0].url").value("https://example.com/img.jpg"));
    }
}
