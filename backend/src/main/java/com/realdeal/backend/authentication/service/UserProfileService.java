package com.realdeal.backend.authentication.service;

import com.realdeal.backend.authentication.model.UserProfile;
import com.realdeal.backend.authentication.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

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

}
