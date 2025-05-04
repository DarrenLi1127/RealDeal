package com.realdeal.backend.genre.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_genres")
public class UserGenre {

  @EmbeddedId
  private UserGenreId id;

  @Column(name = "selected_at", nullable = false)
  private LocalDateTime selectedAt = LocalDateTime.now();

  // Helper method for creating new instances
  public static UserGenre create(String userId, Integer genreId) {
    UserGenre userGenre = new UserGenre();
    userGenre.setId(new UserGenreId(userId, genreId));
    userGenre.setSelectedAt(LocalDateTime.now());
    return userGenre;
  }
}