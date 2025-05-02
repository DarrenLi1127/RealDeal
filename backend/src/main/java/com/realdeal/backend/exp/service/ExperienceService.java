package com.realdeal.backend.exp.service;

import com.realdeal.backend.authentication.model.UserProfile;
import com.realdeal.backend.authentication.repository.UserProfileRepository;
import com.realdeal.backend.exp.util.LevelUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ExperienceService {

    private final UserProfileRepository repo;

    @Transactional
    public void addExp(String userId, int delta) {
        UserProfile u = repo.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        u.setExperience(u.getExperience() + delta);

        int newLevel = LevelUtil.levelFor(u.getExperience());
        if (newLevel != u.getLevel()) {
            u.setLevel(newLevel);
            // TODO: notify via WebSocket / email
        }
    }

    /** give the daily bonus (once per calendar date) */
    @Transactional
    public void grantDailyLoginExp(String userId, int dailyBonus) {
        UserProfile u = repo.findById(userId).orElseThrow();
        if (!LocalDate.now().equals(u.getLastDailyExp())) {
            addExp(userId, dailyBonus);
            u.setLastDailyExp(LocalDate.now());
        }
    }
}
