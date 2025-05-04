package com.realdeal.backend.genre.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GenreDTO {
  private Integer id;
  private String name;
  private String description;
}
