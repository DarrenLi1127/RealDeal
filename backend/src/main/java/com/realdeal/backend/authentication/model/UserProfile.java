package com.realdeal.backend.authentication.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
public class UserProfile {
  @Id
  @Column(name = "user_id", length = 50)
  private String userId;

  @Column(nullable = false, unique = true, length = 50)
  private String username;

  @Column(nullable = false, unique = true, length = 100)
  private String email;

  @Column(name = "profile_image_url")
  private String profileImageUrl;

  @Column(name = "reputation_score", nullable = false)
  private Integer reputationScore = 0;

  @Column(name = "reviewer_level", nullable = false)
  private String reviewerLevel = "Beginner Reviewer";

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt = LocalDateTime.now();
}