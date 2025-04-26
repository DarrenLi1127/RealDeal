package com.realdeal.backend.authentication.service;

import com.realdeal.backend.authentication.model.UserProfile;
import com.realdeal.backend.authentication.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

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

  public UserProfile getUserProfile(String userId) {
    return userProfileRepository.findById(userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
  }

  public String getUsernameByUserId(String userId) {
    UserProfile userProfile = userProfileRepository.findById(userId)
        .orElse(null);
    return userProfile != null ? userProfile.getUsername() : "Unknown User";
  }

  public Map<String, String> getUsernamesByUserIds(List<String> userIds) {
    List<UserProfile> profiles = userProfileRepository.findAllById(userIds);

    return profiles.stream()
        .collect(Collectors.toMap(
            UserProfile::getUserId,
            UserProfile::getUsername,
            (existing, replacement) -> existing
        ));
  }

  private void validateUsername(String username) {
    if (username == null || username.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is required");
    }

    if (username.length() < 3 || username.length() > 20) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Username must be between 3-20 characters"
      );
    }
  }

  public UserProfile registerUser(UserProfile userProfile) {
    if(userProfile.getUserId() == null || userProfile.getUserId().isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User ID is required");
    }

    validateUsername(userProfile.getUsername());

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

  public UserProfile updateUsername(String userId, UserProfile updatedProfile) {
    UserProfile existingProfile = userProfileRepository.findById(userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

    if(updatedProfile.getUsername() != null && !updatedProfile.getUsername().isEmpty()
        && !updatedProfile.getUsername().equals(existingProfile.getUsername())) {
      // Validate the new username
      validateUsername(updatedProfile.getUsername());

      if(userProfileRepository.existsByUsername(updatedProfile.getUsername())) {
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already taken");
      }
      existingProfile.setUsername(updatedProfile.getUsername());
    }
    return userProfileRepository.save(existingProfile);
  }

}