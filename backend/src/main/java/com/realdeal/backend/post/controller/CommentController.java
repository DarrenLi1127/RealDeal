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

import java.util.List;
import java.util.Map;
import java.util.UUID;
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

    Page<Comment> comments = commentService.getTopLevelComments(postId, page, size);

    // Collect all user IDs from comments and their replies
    List<String> userIds = comments.getContent().stream()
        .map(Comment::getUserId)
        .distinct()
        .collect(Collectors.toList());

    // Add user IDs from replies
    comments.getContent().forEach(comment -> {
      comment.getReplies().forEach(reply -> {
        userIds.add(reply.getUserId());
      });
    });

    // Fetch usernames in batch
    Map<String, String> usernameMap = userProfileService.getUsernamesByUserIds(userIds);

    // Convert to DTOs with usernames
    List<CommentDTO> commentDTOs = comments.getContent().stream()
        .map(comment -> {
          String username = usernameMap.getOrDefault(comment.getUserId(), "Unknown User");
          boolean liked = userId != null && commentService.hasLikedComment(comment.getId(), userId);
          return CommentDTO.fromComment(comment, username, liked);
        })
        .collect(Collectors.toList());

    Page<CommentDTO> dtoPage = new PageImpl<>(
        commentDTOs,
        comments.getPageable(),
        comments.getTotalElements()
    );

    return ResponseEntity.ok(dtoPage);
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