package com.realdeal.backend.authentication.service;

import com.realdeal.backend.authentication.model.UserProfile;
import com.realdeal.backend.authentication.repository.UserProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserProfileServiceTest {

    @Mock  private UserProfileRepository repo;
    @InjectMocks private UserProfileService service;

    @BeforeEach void init(){ MockitoAnnotations.openMocks(this); }

    @Test
    void getUsername_returnsFallbackWhenMissing() {
        when(repo.findById("x")).thenReturn(Optional.empty());
        assertEquals("Unknown User", service.getUsernameByUserId("x"));
    }

    @Test
    void registerUser_failsForDuplicateEmail() {
        UserProfile in = new UserProfile();
        in.setUserId("id");
        in.setUsername("usr");
        in.setEmail("e@x");
        when(repo.existsByEmail("e@x")).thenReturn(true);
        assertThrows(RuntimeException.class, () -> service.registerUser(in));
    }
}
