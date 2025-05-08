package com.realdeal.backend.post.repository;

import com.realdeal.backend.post.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {

    @Modifying
    @Query("UPDATE Post p SET p.likesCount = p.likesCount + 1 WHERE p.id = :id")
    void incrementLikes(@Param("id") UUID id);

    @Modifying
    @Query("UPDATE Post p SET p.likesCount = p.likesCount - 1 WHERE p.id = :id")
    void decrementLikes(@Param("id") UUID id);

    @Modifying
    @Query("UPDATE Post p SET p.starsCount = p.starsCount + 1 WHERE p.id = :id")
    void incrementStars(@Param("id") UUID id);

    @Modifying
    @Query("UPDATE Post p SET p.starsCount = p.starsCount - 1 WHERE p.id = :id")
    void decrementStars(@Param("id") UUID id);

    Page<Post> findByUserId(String userId, Pageable pageable);

    long countByUserId(String userId);
}
