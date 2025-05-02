package com.realdeal.backend.exp.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.realdeal.backend.exp.service.ExperienceService;

import java.io.IOException;

/**
 * Grants the daily-login EXP the first time an authenticated
 * request hits the backend each day.
 */
@Component
@RequiredArgsConstructor
public class DailyExpFilter extends OncePerRequestFilter {

    private final ExperienceService expService;

    @Override
    protected void doFilterInternal(HttpServletRequest req,
        HttpServletResponse res,
        FilterChain chain)
        throws ServletException, IOException {

        String uid = req.getHeader("X-USER-ID");     // adapt to your auth
        if (uid != null) {
            expService.grantDailyLoginExp(uid, 10);  // 10 EXP daily bonus
        }
        chain.doFilter(req, res);
    }
}
