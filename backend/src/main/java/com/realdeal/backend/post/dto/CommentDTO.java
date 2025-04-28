package com.realdeal.backend.post.dto;

import com.realdeal.backend.post.model.Comment;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
public class CommentDTO {
  private UUID id;
  private UUID postId;
  private String userId;
  private String username;
  private String content;
  private UUID parentId;
  private List<CommentDTO> replies = new ArrayList<>();
  private int likesCount;
  private boolean liked;
  private LocalDateTime createdAt;

  public static CommentDTO fromComment(Comment comment, String username, boolean liked) {
    CommentDTO dto = new CommentDTO();
    dto.setId(comment.getId());
    dto.setPostId(comment.getPost().getId());
    dto.setUserId(comment.getUserId());
    dto.setUsername(username);
    dto.setContent(comment.getContent());
    if (comment.getParentComment() != null) {
      dto.setParentId(comment.getParentComment().getId());
    }
    dto.setLikesCount(comment.getLikesCount());
    dto.setLiked(liked);
    dto.setCreatedAt(comment.getCreatedAt());
    dto.setReplies(comment.getReplies().stream()
        .map(reply -> CommentDTO.fromComment(reply, username, false))
        .collect(Collectors.toList()));
    return dto;
  }

  public static CommentDTO fromComment(Comment comment, String username) {
    return fromComment(comment, username, false);
  }
}