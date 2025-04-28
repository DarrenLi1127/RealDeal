package com.realdeal.backend.post.repository;

import com.realdeal.backend.post.model.CommentLike;
import com.realdeal.backend.post.model.pk.CommentLikePK;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CommentLikeRepository extends JpaRepository<CommentLike, CommentLikePK> {
  long countByCommentId(UUID commentId);
  boolean existsByCommentIdAndUserId(UUID commentId, String userId);
}