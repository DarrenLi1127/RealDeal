package com.realdeal.backend.genre.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostGenreAssignRequest {
  private List<Integer> genreIds;
}