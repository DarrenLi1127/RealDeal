package com.realdeal.backend.genre.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.io.Serializable;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class PostGenreId implements Serializable {

  @Column(name = "post_id")
  private UUID postId;

  @Column(name = "genre_id")
  private Integer genreId;
}