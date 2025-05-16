package com.realdeal.backend.authentication.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.realdeal.backend.authentication.model.UserProfile;
import com.realdeal.backend.authentication.service.UserProfileService;
import com.realdeal.backend.exp.config.DailyExpFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Slice tests for {@link UserProfileController}.
 */
@WebMvcTest(
    controllers = UserProfileController.class,
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = DailyExpFilter.class
    )
)
class UserProfileControllerTest {

    @Autowired private MockMvc mvc;
    @Autowired private ObjectMapper mapper;

    @MockitoBean private UserProfileService userProfileService;

    /* ---------- helpers ---------- */

    private UserProfile mockProfile() {
        UserProfile u = new UserProfile();
        u.setUserId("u123");
        u.setUsername("mockUser");
        u.setEmail("mock@real.deal");
        u.setProfileImageUrl("https://example.com/avatar.png");
        u.setReputationScore(0);
        u.setReviewerLevel("Beginner Reviewer");
        u.setCreatedAt(LocalDateTime.now());
        return u;
    }

    /* ---------- /exists/{id} ---------- */

    @Test
    void exists_true_returnsTrue() throws Exception {
        when(userProfileService.ifUserExists("u123")).thenReturn(true);

        mvc.perform(get("/api/users/exists/{id}", "u123"))
            .andExpect(status().isOk())
            .andExpect(content().string("true"));
    }

    @Test
    void exists_false_returnsFalse() throws Exception {
        when(userProfileService.ifUserExists("ghost")).thenReturn(false);

        mvc.perform(get("/api/users/exists/{id}", "ghost"))
            .andExpect(status().isOk())
            .andExpect(content().string("false"));
    }

    /* ---------- GET /{id} ---------- */

    @Test
    void getProfile_returnsProfileDto() throws Exception {
        UserProfile p = mockProfile();
        when(userProfileService.getUserProfile("u123")).thenReturn(p);

        mvc.perform(get("/api/users/{id}", "u123"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.username").value("mockUser"))
            .andExpect(jsonPath("$.email").value("mock@real.deal"));
    }

    /* ---------- POST /register ---------- */

    @Test
    void register_success_returnsCreatedProfile() throws Exception {
        UserProfile req = mockProfile();
        when(userProfileService.registerUser(any(UserProfile.class))).thenReturn(req);

        mvc.perform(post("/api/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.username").value("mockUser"));
    }

    @Test
    void register_duplicateUsername_returnsConflict() throws Exception {
        UserProfile req = mockProfile();
        when(userProfileService.registerUser(any(UserProfile.class)))
            .thenThrow(new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT, "Username is already taken"));

        mvc.perform(post("/api/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
            .andExpect(status().isConflict());
    }

    /* ---------- PATCH /{id}/username ---------- */

    @Test
    void updateUsername_success_returnsUpdatedProfile() throws Exception {
        UserProfile updated = mockProfile();
        updated.setUsername("newName");

        when(userProfileService.updateUsername(eq("u123"), any(UserProfile.class))).thenReturn(updated);

        mvc.perform(patch("/api/users/{id}/username", "u123")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"newName\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.username").value("newName"));
    }

    @Test
    void updateUsername_taken_returnsConflict() throws Exception {
        when(userProfileService.updateUsername(eq("u123"), any(UserProfile.class)))
            .thenThrow(new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT, "Username is already taken"));

        mvc.perform(patch("/api/users/{id}/username", "u123")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"dup\"}"))
            .andExpect(status().isConflict());
    }
}
