package com.realdeal.backend.post.controller;

import com.realdeal.backend.authentication.service.UserProfileService;
import com.realdeal.backend.exp.config.DailyExpFilter;
import com.realdeal.backend.exp.service.ExperienceService;
import com.realdeal.backend.genre.service.GenreService;
import com.realdeal.backend.post.model.Post;
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
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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

    @MockitoBean private PostService postService;
    @MockitoBean private UserProfileService userProfileService;
    @MockitoBean private ReactionService reactionService;
    @MockitoBean private PostRepository postRepository;
    @MockitoBean private GenreService genreService;
    @MockitoBean private RecommendationService recommendationService;
    @MockitoBean private ExperienceService experienceService;

    @Test
    void getPosts_returnsPagedDtos() throws Exception {
        Post p = new Post(); p.setUserId("u"); p.setTitle("t");

        when(postService.getPaginatedPosts(0, 9)).thenReturn(new PageImpl<>(List.of(p)));
        when(userProfileService.getUsernamesByUserIds(any())).thenReturn(Map.of("u", "name"));

        mvc.perform(get("/api/posts/all?page=0&size=9"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[0].title").value("t"));
    }
}
