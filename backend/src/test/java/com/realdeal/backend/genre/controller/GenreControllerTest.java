package com.realdeal.backend.genre.controller;

import com.realdeal.backend.exp.config.DailyExpFilter;
import com.realdeal.backend.genre.model.Genre;
import com.realdeal.backend.genre.service.GenreService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = GenreController.class,
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = DailyExpFilter.class
    )
)
class GenreControllerTest {

    @Autowired private MockMvc mvc;

    @MockitoBean
    private GenreService service;

    @Test
    void getAllGenres_returnsJsonArray() throws Exception {
        Genre g = new Genre();
        g.setId(1);
        g.setName("Action");

        when(service.getAllGenres()).thenReturn(List.of(g));

        mvc.perform(get("/api/genres"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].name").value("Action"));
    }
}
