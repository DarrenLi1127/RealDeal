package com.realdeal.backend.post.dto;

import com.realdeal.backend.post.model.Comment;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

  public static CommentDTO fromComment(Comment comment, String username, boolean liked, Map<UUID, Boolean> likeStatusMap) {
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
        .map(reply -> {
          // Get username for reply author
          String replyUsername = username; // Default to parent comment username (will be overridden in controller)
          // Check if we have a like status for this reply
          boolean replyLiked = likeStatusMap.getOrDefault(reply.getId(), false);
          return CommentDTO.fromComment(reply, replyUsername, replyLiked, likeStatusMap);
        })
        .collect(Collectors.toList()));
    return dto;
  }

  // Overload for backward compatibility
  public static CommentDTO fromComment(Comment comment, String username, boolean liked) {
    return fromComment(comment, username, liked, new HashMap<>());
  }

  // Simple converter without like status
  public static CommentDTO fromComment(Comment comment, String username) {
    return fromComment(comment, username, false);
  }
}