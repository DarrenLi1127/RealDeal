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
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

  private final CommentRepository commentRepository;
  private final PostRepository postRepository;
  private final CommentLikeRepository commentLikeRepository;

  @Caching(evict = {
      @CacheEvict(cacheNames = "commentContent", allEntries = true),
      @CacheEvict(cacheNames = "commentCount", allEntries = true),
      @CacheEvict(cacheNames = "allComments", allEntries = true)
  })
  public Comment addComment(UUID postId, String userId, String content, UUID parentCommentId) {
    // Validate input
    if (userId == null || userId.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId required");
    }
    if (content == null || content.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "content required");
    }

    Post post = postRepository.findById(postId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

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

  /**
   * Get top-level comments for a post with pagination
   * This method doesn't cache the Page object directly, but separates content and count
   */
  public Page<Comment> getTopLevelComments(UUID postId, int page, int size) {
    // Get content and count separately (they're cached individually)
    List<Comment> content = getTopLevelCommentsContent(postId, page, size);
    long count = getTopLevelCommentsCount(postId);

    // Construct the Page object with the cached components
    PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
    return new PageImpl<>(content, pageRequest, count);
  }

  /**
   * Cache only the comment content
   */
  @Cacheable(cacheNames = "commentContent", key = "#postId + ':page:' + #page + ':size:' + #size")
  public List<Comment> getTopLevelCommentsContent(UUID postId, int page, int size) {
    PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
    Page<Comment> commentsPage = commentRepository.findTopLevelCommentsByPostId(postId, pageRequest);

    // Create detached copies to avoid proxy serialization issues
    return commentsPage.getContent().stream()
        .map(this::createDetachedCopy)
        .collect(Collectors.toList());
  }

  /**
   * Cache the total comments count
   */
  @Cacheable(cacheNames = "commentCount", key = "#postId")
  public long getTopLevelCommentsCount(UUID postId) {
    return commentRepository.countByPostIdAndParentCommentIsNull(postId);
  }

  private Comment createDetachedCopy(Comment original) {
    if (original == null) return null;

    Comment copy = new Comment();

    // Copy simple properties
    copy.setId(original.getId());
    copy.setUserId(original.getUserId());
    copy.setContent(original.getContent());
    copy.setLikesCount(original.getLikesCount());
    copy.setCreatedAt(original.getCreatedAt());

    // Handle relationships carefully
    if (original.getPost() != null) {
      Post postCopy = new Post();
      postCopy.setId(original.getPost().getId());
      // Only set minimum required properties for Post
      copy.setPost(postCopy);
    }

    if (original.getParentComment() != null) {
      Comment parentCopy = new Comment();
      parentCopy.setId(original.getParentComment().getId());
      copy.setParentComment(parentCopy);
    }

    // Handle replies recursively
    if (original.getReplies() != null && !original.getReplies().isEmpty()) {
      List<Comment> repliesCopy = original.getReplies().stream()
          .map(this::createDetachedCopy)
          .collect(Collectors.toList());
      copy.setReplies(repliesCopy);
    } else {
      copy.setReplies(new ArrayList<>());
    }

    return copy;
  }

  @Cacheable(cacheNames = "allComments", key = "#postId")
  public List<Comment> getAllCommentsByPostId(UUID postId) {
    List<Comment> comments = commentRepository.findByPostIdOrderByCreatedAtAsc(postId);

    // Create detached copies to avoid proxy serialization issues
    return comments.stream()
        .map(this::createDetachedCopy)
        .collect(Collectors.toList());
  }

  @Transactional
  @Caching(evict = {
      @CacheEvict(cacheNames = "commentLikes", key = "#commentId + ':' + #userId"),
      @CacheEvict(cacheNames = "commentContent", allEntries = true),
      @CacheEvict(cacheNames = "allComments", allEntries = true)
  })
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

  @Cacheable(cacheNames = "commentLikes", key = "#commentId + ':' + #userId")
  public boolean hasLikedComment(UUID commentId, String userId) {
    return commentLikeRepository.existsByCommentIdAndUserId(commentId, userId);
  }
}