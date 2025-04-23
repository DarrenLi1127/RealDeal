package com.realdeal.backend.authentication.service;

import com.realdeal.backend.authentication.model.UserProfile;
import com.realdeal.backend.authentication.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.Optional;

@Service
public class UserProfileService {

  private final UserProfileRepository userProfileRepository;

  @Autowired
  public UserProfileService(UserProfileRepository userProfileRepository) {
    this.userProfileRepository = userProfileRepository;
  }

  public boolean ifUserExists(String userId) {
    return userProfileRepository.existsByUserId(userId);
  }

  public UserProfile registerUser(UserProfile userProfile) {

    if(userProfile.getUserId() == null || userProfile.getUserId().isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User ID is required");
    }

    if(userProfile.getUsername() == null || userProfile.getUsername().isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is required");
    }

    if(userProfile.getEmail() == null || userProfile.getEmail().isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
    }

    //check if user profile exists
    if(userProfileRepository.existsByEmail(userProfile.getEmail())) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already taken.");
    }
    if(userProfileRepository.existsByUsername(userProfile.getUsername())) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already taken");
    }

    userProfile.setReputationScore(0);
    userProfile.setReviewerLevel("Beginner Reviewer");

    return userProfileRepository.save(userProfile);
  }

  public UserProfile updateUserProfile(String userId, UserProfile updatedProfile) {
    // First check if the user exists
    Optional<UserProfile> existingUser = userProfileRepository.findById(userId);
    if (!existingUser.isPresent()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with ID: " + userId);
    }

    UserProfile currentProfile = existingUser.get();
    
    // Check if username is being changed and is already taken by another user
    if (!currentProfile.getUsername().equals(updatedProfile.getUsername()) && 
        userProfileRepository.existsByUsername(updatedProfile.getUsername())) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already taken");
    }

    // Update only allowed fields
    currentProfile.setUsername(updatedProfile.getUsername());
    
    // Update profile image URL if provided
    if (updatedProfile.getProfileImageUrl() != null && !updatedProfile.getProfileImageUrl().isEmpty()) {
      currentProfile.setProfileImageUrl(updatedProfile.getProfileImageUrl());
    }
    
    // Do not allow changing of: userId, email, reputation, reviewerLevel, createdAt

    return userProfileRepository.save(currentProfile);
  }
}
