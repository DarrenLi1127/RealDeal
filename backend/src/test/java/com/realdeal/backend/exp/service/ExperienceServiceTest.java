package com.realdeal.backend.exp.service;

import com.realdeal.backend.authentication.model.UserProfile;
import com.realdeal.backend.authentication.repository.UserProfileRepository;
import com.realdeal.backend.exp.util.LevelUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExperienceServiceTest {

    @Mock  private UserProfileRepository repo;
    @InjectMocks private ExperienceService experienceService;

    @Test
    void addExp_updatesExperienceAndLevel() {
        UserProfile u = new UserProfile();
        u.setUserId("u1");
        u.setExperience(10);   // imagine these getters/setters exist
        u.setLevel(1);

        when(repo.findById("u1")).thenReturn(Optional.of(u));

        // mock LevelUtil.levelFor(...) to return a higher level
        try (MockedStatic<LevelUtil> mocked = Mockito.mockStatic(LevelUtil.class)) {
            mocked.when(() -> LevelUtil.levelFor(25)).thenReturn(2);

            experienceService.addExp("u1", 15);

            assertEquals(25, u.getExperience());
            assertEquals(2,  u.getLevel());
        }
    }

    @Test
    void grantDailyLoginExp_givesBonusOnlyOncePerDay() {
        UserProfile u = new UserProfile();
        u.setUserId("u2");
        u.setExperience(0);
        u.setLevel(1);
        u.setLastDailyExp(LocalDate.now().minusDays(1)); // yesterday

        when(repo.findById("u2")).thenReturn(Optional.of(u));

        try (MockedStatic<LevelUtil> mocked = Mockito.mockStatic(LevelUtil.class)) {
            mocked.when(() -> LevelUtil.levelFor(5)).thenReturn(1);

            experienceService.grantDailyLoginExp("u2", 5);

            assertEquals(5, u.getExperience());
            assertEquals(LocalDate.now(), u.getLastDailyExp());
        }

        // second call on the same day should do nothing
        experienceService.grantDailyLoginExp("u2", 5);
        assertEquals(5, u.getExperience()); // unchanged
    }
}
