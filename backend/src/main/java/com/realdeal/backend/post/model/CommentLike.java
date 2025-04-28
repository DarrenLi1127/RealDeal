package com.realdeal.backend.post.model;

import com.realdeal.backend.post.model.pk.CommentLikePK;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "comment_likes")
@IdClass(CommentLikePK.class)
public class CommentLike {

  @Id
  private UUID commentId;

  @Id
  private String userId;

  private LocalDateTime createdAt = LocalDateTime.now();
}