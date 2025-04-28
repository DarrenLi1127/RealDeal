package com.realdeal.backend.post.dto;

import com.realdeal.backend.post.model.Post;
import com.realdeal.backend.post.model.PostImage;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
public class PostWithUserDTO {
  private UUID id;
  private String userId;
  private String username;
  private String title;
  private String content;
  private List<PostImageDTO> images;
  private LocalDateTime createdAt;

  private int  likesCount;
  private int  starsCount;
  private boolean liked;
  private boolean starred;


  public static PostWithUserDTO fromPost(Post post, String username, boolean liked, boolean starred) {
    PostWithUserDTO dto = new PostWithUserDTO();
    dto.setId(post.getId());
    dto.setUserId(post.getUserId());
    dto.setUsername(username);
    dto.setTitle(post.getTitle());
    dto.setContent(post.getContent());
    dto.setImages(post.getImages().stream()
        .map(PostImageDTO::fromPostImage)
        .collect(Collectors.toList()));
    dto.setCreatedAt(post.getCreatedAt());

    dto.setLikesCount(post.getLikesCount());
    dto.setStarsCount(post.getStarsCount());
    dto.setLiked(liked);
    dto.setStarred(starred);


    return dto;
  }

  public static PostWithUserDTO fromPost(Post post, String username) {
    return fromPost(post, username, false, false);
  }

  @Data
  public static class PostImageDTO {
    private UUID id;
    private int position;
    private String url;

    public static PostImageDTO fromPostImage(PostImage image) {
      PostImageDTO dto = new PostImageDTO();
      dto.setId(image.getId());
      dto.setPosition(image.getPosition());
      dto.setUrl(image.getUrl());
      return dto;
    }
  }
}