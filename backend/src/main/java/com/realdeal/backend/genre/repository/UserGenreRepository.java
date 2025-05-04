package com.realdeal.backend.genre.repository;

import com.realdeal.backend.genre.model.UserGenre;
import com.realdeal.backend.genre.model.UserGenreId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserGenreRepository extends JpaRepository<UserGenre, UserGenreId> {

  List<UserGenre> findByIdUserId(String userId);

  @Query("SELECT ug FROM UserGenre ug WHERE ug.id.userId = :userId ORDER BY ug.selectedAt DESC")
  List<UserGenre> findUserGenresByUserId(@Param("userId") String userId);

  void deleteByIdUserId(String userId);

  void deleteByIdUserIdAndIdGenreId(String userId, Integer genreId);

  @Query("SELECT COUNT(ug) FROM UserGenre ug WHERE ug.id.userId = :userId")
  int countByUserId(@Param("userId") String userId);
}
