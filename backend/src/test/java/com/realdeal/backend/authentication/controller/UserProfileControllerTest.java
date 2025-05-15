package com.realdeal.backend.authentication.controller;

import com.realdeal.backend.authentication.service.UserProfileService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserProfileController.class)
class UserProfileControllerTest {

    @Autowired private MockMvc mvc;

    @MockitoBean
    private UserProfileService service;

    @Test
    void checkExists_endpointDelegates() throws Exception {
        when(service.ifUserExists("abc")).thenReturn(true);

        mvc.perform(get("/api/users/exists/abc"))
            .andExpect(status().isOk())
            .andExpect(content().string("true"));
    }
}
