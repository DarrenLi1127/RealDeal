package com.realdeal.backend.genre.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class UserGenreId implements Serializable {

  @Column(name = "user_id", length = 50)
  private String userId;

  @Column(name = "genre_id")
  private Integer genreId;
}