package com.realdeal.backend.post.repository;

import com.realdeal.backend.post.model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {
  // Find top-level comments for a post (comments without a parent)
  @Query("SELECT c FROM Comment c WHERE c.post.id = :postId AND c.parentComment IS NULL")
  Page<Comment> findTopLevelCommentsByPostId(@Param("postId") UUID postId, Pageable pageable);

  // Find all comments (top-level and replies) for a post
  List<Comment> findByPostIdOrderByCreatedAtAsc(UUID postId);

  // Count comments for a post
  long countByPostId(UUID postId);

  // Increment likes
  @Modifying
  @Query("UPDATE Comment c SET c.likesCount = c.likesCount + 1 WHERE c.id = :id")
  void incrementLikes(@Param("id") UUID id);

  // Decrement likes
  @Modifying
  @Query("UPDATE Comment c SET c.likesCount = c.likesCount - 1 WHERE c.id = :id")
  void decrementLikes(@Param("id") UUID id);

  long countByPostIdAndParentCommentIsNull(UUID postId);
}