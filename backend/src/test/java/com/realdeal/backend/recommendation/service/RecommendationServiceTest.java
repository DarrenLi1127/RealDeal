package com.realdeal.backend.recommendation.service;

import com.realdeal.backend.genre.model.Genre;
import com.realdeal.backend.genre.service.GenreService;
import com.realdeal.backend.post.model.Post;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecommendationServiceTest {

    @Mock  private GenreService genreService;
    @InjectMocks private RecommendationService recommendationService;

    private Genre action, comedy;
    private Post  match, noMatch;

    @BeforeEach
    void init() {
        action  = new Genre(); action.setId(1); action.setName("Action");
        comedy  = new Genre(); comedy.setId(2); comedy.setName("Comedy");

        match   = new Post();
        match.setId(UUID.randomUUID());
        match.setCreatedAt(LocalDateTime.now().minusMinutes(1));

        noMatch = new Post();
        noMatch.setId(UUID.randomUUID());
        noMatch.setCreatedAt(LocalDateTime.now().minusMinutes(2));
    }

    @Test
    void applyRecommendationLogic_prioritisesGenreOverlap() {
        when(genreService.getUserGenres("u")).thenReturn(List.of(action));
        when(genreService.getPostGenres(match.getId())).thenReturn(List.of(action));
        when(genreService.getPostGenres(noMatch.getId())).thenReturn(List.of(comedy));

        List<Post> ranked = recommendationService.applyRecommendationLogic(
            List.of(noMatch, match), "u", 0);

        assertEquals(List.of(match, noMatch), ranked);
    }

    @Test
    void returnsInputUnchanged_whenUserIdNull() {
        List<Post> in = List.of(match, noMatch);
        List<Post> out = recommendationService.applyRecommendationLogic(in, null, 0);
        assertSame(in, out);
    }

    @Test
    void returnsInputUnchanged_whenUserHasNoGenres() {
        when(genreService.getUserGenres("u")).thenReturn(List.of());

        List<Post> in = List.of(match, noMatch);
        List<Post> out = recommendationService.applyRecommendationLogic(in, "u", 0);
        assertSame(in, out);
    }
}
