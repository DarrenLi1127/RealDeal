package com.realdeal.backend.post.service;

import com.realdeal.backend.post.model.Comment;
import com.realdeal.backend.post.model.CommentLike;
import com.realdeal.backend.post.model.Post;
import com.realdeal.backend.post.model.pk.CommentLikePK;
import com.realdeal.backend.post.repository.CommentLikeRepository;
import com.realdeal.backend.post.repository.CommentRepository;
import com.realdeal.backend.post.repository.PostRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommentService {

  private final CommentRepository commentRepository;
  private final PostRepository postRepository;
  private final CommentLikeRepository commentLikeRepository;

  public Comment addComment(UUID postId, String userId, String content, UUID parentCommentId) {
    // Validate input
    if (userId == null || userId.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId required");
    }
    if (content == null || content.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "content required");
    }

    // Find the post
    Post post = postRepository.findById(postId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

    // Create new comment
    Comment comment = new Comment();
    comment.setPost(post);
    comment.setUserId(userId);
    comment.setContent(content.trim());

    // If it's a reply, set the parent comment
    if (parentCommentId != null) {
      Comment parentComment = commentRepository.findById(parentCommentId)
          .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent comment not found"));
      comment.setParentComment(parentComment);
    }

    return commentRepository.save(comment);
  }

  public Page<Comment> getTopLevelComments(UUID postId, int page, int size) {
    PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
    return commentRepository.findTopLevelCommentsByPostId(postId, pageRequest);
  }

  public List<Comment> getAllCommentsByPostId(UUID postId) {
    return commentRepository.findByPostIdOrderByCreatedAtAsc(postId);
  }

  @Transactional
  public boolean toggleCommentLike(UUID commentId, String userId) {
    CommentLikePK pk = new CommentLikePK(commentId, userId);

    if (commentLikeRepository.existsById(pk)) {
      // Unlike
      commentLikeRepository.deleteById(pk);
      commentRepository.decrementLikes(commentId);
      return false;
    } else {
      // Like
      CommentLike like = new CommentLike();
      like.setCommentId(commentId);
      like.setUserId(userId);
      commentLikeRepository.save(like);
      commentRepository.incrementLikes(commentId);
      return true;
    }
  }

  public boolean hasLikedComment(UUID commentId, String userId) {
    return commentLikeRepository.existsByCommentIdAndUserId(commentId, userId);
  }
}
