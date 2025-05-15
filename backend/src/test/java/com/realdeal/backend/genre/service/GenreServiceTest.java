package com.realdeal.backend.genre.service;

import com.realdeal.backend.genre.model.Genre;
import com.realdeal.backend.genre.repository.GenreRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GenreServiceTest {

    @Mock private GenreRepository repo;
    @InjectMocks private GenreService service;

    @BeforeEach void init(){ MockitoAnnotations.openMocks(this); }

    @Test
    void getAllGenres_returnsList() {
        when(repo.findAll()).thenReturn(List.of(new Genre()));
        assertEquals(1, service.getAllGenres().size());
    }

    @Test
    void getGenreById_throwsWhenMissing() {
        when(repo.findById(1)).thenReturn(java.util.Optional.empty());
        assertThrows(RuntimeException.class, () -> service.getGenreById(1));
    }
}
