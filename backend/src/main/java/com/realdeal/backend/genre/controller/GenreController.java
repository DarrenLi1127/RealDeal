package com.realdeal.backend.genre.controller;

import com.realdeal.backend.genre.dto.GenreDTO;
import com.realdeal.backend.genre.dto.UserGenreUpdateRequest;
import com.realdeal.backend.genre.dto.PostGenreAssignRequest;
import com.realdeal.backend.genre.model.Genre;
import com.realdeal.backend.genre.service.GenreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/genres")
@RequiredArgsConstructor
public class GenreController {

  private final GenreService genreService;

  @GetMapping
  public ResponseEntity<List<GenreDTO>> getAllGenres() {
    List<Genre> genres = genreService.getAllGenres();
    List<GenreDTO> genreDTOs = genres.stream()
        .map(genre -> new GenreDTO(genre.getId(), genre.getName(), genre.getDescription()))
        .collect(Collectors.toList());

    return ResponseEntity.ok(genreDTOs);
  }

  @GetMapping("/{id}")
  public ResponseEntity<GenreDTO> getGenreById(@PathVariable Integer id) {
    Genre genre = genreService.getGenreById(id);
    GenreDTO genreDTO = new GenreDTO(genre.getId(), genre.getName(), genre.getDescription());

    return ResponseEntity.ok(genreDTO);
  }

  @PutMapping("/users/{userId}")
  public ResponseEntity<List<GenreDTO>> updateUserGenres(
      @PathVariable String userId,
      @RequestBody UserGenreUpdateRequest request) {

    genreService.updateUserGenres(userId, request.getGenreIds());
    List<Genre> userGenres = genreService.getUserGenres(userId);

    List<GenreDTO> genreDTOs = userGenres.stream()
        .map(genre -> new GenreDTO(genre.getId(), genre.getName(), genre.getDescription()))
        .collect(Collectors.toList());

    return ResponseEntity.ok(genreDTOs);
  }

  @GetMapping("/users/{userId}")
  public ResponseEntity<List<GenreDTO>> getUserGenres(@PathVariable String userId) {
    List<Genre> userGenres = genreService.getUserGenres(userId);

    List<GenreDTO> genreDTOs = userGenres.stream()
        .map(genre -> new GenreDTO(genre.getId(), genre.getName(), genre.getDescription()))
        .collect(Collectors.toList());

    return ResponseEntity.ok(genreDTOs);
  }

  @PutMapping("/posts/{postId}")
  public ResponseEntity<List<GenreDTO>> assignGenresToPost(
      @PathVariable UUID postId,
      @RequestBody PostGenreAssignRequest request) {

    genreService.assignGenresToPost(postId, request.getGenreIds());
    List<Genre> postGenres = genreService.getPostGenres(postId);

    List<GenreDTO> genreDTOs = postGenres.stream()
        .map(genre -> new GenreDTO(genre.getId(), genre.getName(), genre.getDescription()))
        .collect(Collectors.toList());

    return ResponseEntity.ok(genreDTOs);
  }

  @GetMapping("/posts/{postId}")
  public ResponseEntity<List<GenreDTO>> getPostGenres(@PathVariable UUID postId) {
    List<Genre> postGenres = genreService.getPostGenres(postId);

    List<GenreDTO> genreDTOs = postGenres.stream()
        .map(genre -> new GenreDTO(genre.getId(), genre.getName(), genre.getDescription()))
        .collect(Collectors.toList());

    return ResponseEntity.ok(genreDTOs);
  }
}