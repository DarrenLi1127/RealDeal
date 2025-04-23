package com.realdeal.backend.authentication.controller;

import com.realdeal.backend.authentication.model.UserProfile;
import com.realdeal.backend.authentication.service.UserProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserProfileController {

  private final UserProfileService userProfileService;

  @Autowired
  public UserProfileController(UserProfileService userProfileService) {
    this.userProfileService = userProfileService;
  }

  @GetMapping("/exists/{userId}")
  public ResponseEntity<Boolean> checkUserExists(@PathVariable String userId) {
    boolean exists = userProfileService.ifUserExists(userId);
    return new ResponseEntity<>(exists, HttpStatus.OK);
  }

  @GetMapping("/{userId}")
  public ResponseEntity<UserProfile> getUserProfile(@PathVariable String userId) {
    UserProfile userProfile = userProfileService.getUserProfile(userId);
    return new ResponseEntity<>(userProfile, HttpStatus.OK);
  }

  @PostMapping("/register")
  public ResponseEntity<UserProfile> registerUser(@RequestBody UserProfile userProfile) {
    try {
      UserProfile registeredUser = userProfileService.registerUser(userProfile);
      return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
    } catch (Exception e) {
      System.err.println("Error during user registration: " + e.getMessage());
      throw e;
    }
  }

  @PatchMapping("/{userId}/username")
  public ResponseEntity<UserProfile> updateUserName(
      @PathVariable String userId,
      @RequestBody UserProfile userProfile) {

    UserProfile updatedUser = userProfileService.updateUsername(userId, userProfile);
    return new ResponseEntity<>(updatedUser, HttpStatus.OK);
  }
}