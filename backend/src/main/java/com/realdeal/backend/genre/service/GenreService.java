package com.realdeal.backend.genre.service;

import com.realdeal.backend.genre.model.Genre;
import com.realdeal.backend.genre.model.PostGenre;
import com.realdeal.backend.genre.model.UserGenre;
import com.realdeal.backend.genre.repository.GenreRepository;
import com.realdeal.backend.genre.repository.PostGenreRepository;
import com.realdeal.backend.genre.repository.UserGenreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GenreService {

  private final GenreRepository genreRepository;
  private final UserGenreRepository userGenreRepository;
  private final PostGenreRepository postGenreRepository;

  public List<Genre> getAllGenres() {
    return genreRepository.findAll();
  }

  public Genre getGenreById(Integer id) {
    return genreRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Genre not found with id: " + id));
  }

  public Genre getGenreByName(String name) {
    return genreRepository.findByName(name)
        .orElseThrow(() -> new RuntimeException("Genre not found with name: " + name));
  }

  @Transactional
  public void updateUserGenres(String userId, List<Integer> genreIds) {
    // Validate genre count
    if (genreIds.size() > 3) {
      throw new RuntimeException("Users can select up to 3 genres only");
    }

    // Remove current genres
    userGenreRepository.deleteByIdUserId(userId);

    // Add new genres
    for (Integer genreId : genreIds) {
      UserGenre userGenre = UserGenre.create(userId, genreId);
      userGenreRepository.save(userGenre);
    }
  }

  public List<Genre> getUserGenres(String userId) {
    List<UserGenre> userGenres = userGenreRepository.findByIdUserId(userId);

    return userGenres.stream()
        .map(ug -> getGenreById(ug.getId().getGenreId()))
        .collect(Collectors.toList());
  }

  @Transactional
  public void assignGenresToPost(UUID postId, List<Integer> genreIds) {
    // Validate genre count
    if (genreIds.isEmpty() || genreIds.size() > 3) {
      throw new RuntimeException("Posts must have 1-3 genres");
    }

    // Remove current genres if any
    postGenreRepository.deleteByIdPostId(postId);

    // Add new genres
    for (Integer genreId : genreIds) {
      PostGenre postGenre = PostGenre.create(postId, genreId);
      postGenreRepository.save(postGenre);
    }
  }

  public List<Genre> getPostGenres(UUID postId) {
    List<PostGenre> postGenres = postGenreRepository.findByIdPostId(postId);

    return postGenres.stream()
        .map(pg -> getGenreById(pg.getId().getGenreId()))
        .collect(Collectors.toList());
  }

  public Set<UUID> getPostIdsByGenre(Integer genreId) {
    List<PostGenre> postGenres = postGenreRepository.findByIdGenreId(genreId);

    return postGenres.stream()
        .map(pg -> pg.getId().getPostId())
        .collect(Collectors.toSet());
  }

  public Set<String> getUserIdsByGenre(Integer genreId) {
    List<UserGenre> userGenres = userGenreRepository.findByIdUserId(genreId.toString());

    return userGenres.stream()
        .map(ug -> ug.getId().getUserId())
        .collect(Collectors.toSet());
  }
}