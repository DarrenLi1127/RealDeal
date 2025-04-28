package com.realdeal.backend.post.controller;

import com.realdeal.backend.authentication.service.UserProfileService;
import com.realdeal.backend.post.dto.CommentDTO;
import com.realdeal.backend.post.model.Comment;
import com.realdeal.backend.post.repository.CommentRepository;
import com.realdeal.backend.post.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

  private final CommentService commentService;
  private final UserProfileService userProfileService;
  private final CommentRepository commentRepository;

  @PostMapping("/create")
  public ResponseEntity<CommentDTO> createComment(
      @RequestParam UUID postId,
      @RequestParam String userId,
      @RequestParam String content,
      @RequestParam(required = false) UUID parentCommentId) {

    Comment comment = commentService.addComment(postId, userId, content, parentCommentId);
    String username = userProfileService.getUsernameByUserId(userId);
    CommentDTO dto = CommentDTO.fromComment(comment, username);

    return new ResponseEntity<>(dto, HttpStatus.CREATED);
  }

  @GetMapping("/post/{postId}")
  public ResponseEntity<Page<CommentDTO>> getPostComments(
      @PathVariable UUID postId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(required = false) String userId) {

    // Get top-level comments with pagination
    Page<Comment> comments = commentService.getTopLevelComments(postId, page, size);

    // Collect all comments and replies for like status checking
    List<Comment> allComments = new ArrayList<>();
    Map<UUID, Boolean> likeStatusMap = new HashMap<>();

    // Add top-level comments
    allComments.addAll(comments.getContent());

    // Add all replies (recursive function to get all nested replies)
    for (Comment comment : comments.getContent()) {
      collectAllReplies(comment, allComments);
    }

    // Check like status for all comments if user is provided
    if (userId != null) {
      for (Comment comment : allComments) {
        boolean liked = commentService.hasLikedComment(comment.getId(), userId);
        likeStatusMap.put(comment.getId(), liked);
      }
    }

    // Collect all user IDs from comments and their replies
    List<String> userIds = allComments.stream()
        .map(Comment::getUserId)
        .distinct()
        .collect(Collectors.toList());

    // Fetch usernames in batch
    Map<String, String> usernameMap = userProfileService.getUsernamesByUserIds(userIds);

    // Create a map of comment IDs to usernames for all comments
    Map<UUID, String> commentUsernames = new HashMap<>();
    for (Comment comment : allComments) {
      String username = usernameMap.getOrDefault(comment.getUserId(), "Unknown User");
      commentUsernames.put(comment.getId(), username);
    }

    // Convert to DTOs with usernames and like status
    List<CommentDTO> commentDTOs = comments.getContent().stream()
        .map(comment -> {
          String username = usernameMap.getOrDefault(comment.getUserId(), "Unknown User");
          boolean liked = likeStatusMap.getOrDefault(comment.getId(), false);

          CommentDTO dto = CommentDTO.fromComment(comment, username, liked, likeStatusMap);

          updateReplyUsernames(dto.getReplies(), usernameMap);

          return dto;
        })
        .collect(Collectors.toList());

    Page<CommentDTO> dtoPage = new PageImpl<>(
        commentDTOs,
        comments.getPageable(),
        comments.getTotalElements()
    );

    return ResponseEntity.ok(dtoPage);
  }

  private void updateReplyUsernames(List<CommentDTO> replies, Map<String, String> usernameMap) {
    for (CommentDTO reply : replies) {
      // Update the username of this reply
      reply.setUsername(usernameMap.getOrDefault(reply.getUserId(), "Unknown User"));

      if (!reply.getReplies().isEmpty()) {
        updateReplyUsernames(reply.getReplies(), usernameMap);
      }
    }
  }

  private void collectAllReplies(Comment comment, List<Comment> allComments) {
    for (Comment reply : comment.getReplies()) {
      allComments.add(reply);
      collectAllReplies(reply, allComments);
    }
  }

  @PostMapping("/{commentId}/like")
  @Transactional
  public ResponseEntity<?> likeComment(
      @PathVariable UUID commentId,
      @RequestParam String userId) {

    boolean liked = commentService.toggleCommentLike(commentId, userId);
    int count = commentRepository.findById(commentId).orElseThrow().getLikesCount();

    return ResponseEntity.ok(Map.of("liked", liked, "likes", count));
  }
}