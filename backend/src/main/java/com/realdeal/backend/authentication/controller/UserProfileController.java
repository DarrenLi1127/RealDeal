package com.realdeal.backend.authentication.controller;

import com.realdeal.backend.authentication.model.UserProfile;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserProfileController {

  @PostMapping("/register")
  public UserProfile registerUser(@RequestBody UserProfile userProfile) {
    System.out.println("User Registration Request Received:");
    System.out.println("User ID: " + userProfile.getUserId());
    System.out.println("Username: " + userProfile.getUsername());
    System.out.println("Email: " + userProfile.getEmail());

    return userProfile;
  }
}