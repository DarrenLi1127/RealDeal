package com.realdeal.backend.authentication.repository;

import com.realdeal.backend.authentication.model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, String> {
//  boolean existsByUsername(String username);
//  boolean existsByEmail(String email);
}