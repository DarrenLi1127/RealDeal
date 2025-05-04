package com.realdeal.backend.genre.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@Entity
@Table(name = "post_genres")
public class PostGenre {

  @EmbeddedId
  private PostGenreId id;

  @Column(name = "assigned_at", nullable = false)
  private LocalDateTime assignedAt = LocalDateTime.now();

  // Helper method for creating new instances
  public static PostGenre create(UUID postId, Integer genreId) {
    PostGenre postGenre = new PostGenre();
    postGenre.setId(new PostGenreId(postId, genreId));
    postGenre.setAssignedAt(LocalDateTime.now());
    return postGenre;
  }
}