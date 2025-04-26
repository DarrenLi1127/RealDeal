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

  public static PostWithUserDTO fromPost(Post post, String username) {
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
    return dto;
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