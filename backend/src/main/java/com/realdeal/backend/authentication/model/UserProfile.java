package com.realdeal.backend.authentication.model;

import lombok.Data;

@Data
public class UserProfile {
  private String userId;
  private String username;
  private String email;
}