package com.realdeal.backend.genre.repository;

import com.realdeal.backend.genre.model.PostGenre;
import com.realdeal.backend.genre.model.PostGenreId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PostGenreRepository extends JpaRepository<PostGenre, PostGenreId> {

  List<PostGenre> findByIdPostId(UUID postId);

  List<PostGenre> findByIdGenreId(Integer genreId);

  @Query("SELECT pg FROM PostGenre pg WHERE pg.id.postId = :postId ORDER BY pg.assignedAt ASC")
  List<PostGenre> findPostGenresByPostId(@Param("postId") UUID postId);

  void deleteByIdPostId(UUID postId);

  void deleteByIdPostIdAndIdGenreId(UUID postId, Integer genreId);

  @Query("SELECT COUNT(pg) FROM PostGenre pg WHERE pg.id.postId = :postId")
  int countByPostId(@Param("postId") UUID postId);
}