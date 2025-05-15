package com.realdeal.backend.post.dto;

import com.realdeal.backend.genre.dto.GenreDTO;
import com.realdeal.backend.post.model.Post;
import com.realdeal.backend.post.model.PostImage;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
public class PostWithUserDTO {
  private Integer level;
  private UUID id;
  private String userId;
  private String username;
  private String title;
  private String content;
  private List<PostImageDTO> images;
  private LocalDateTime createdAt;
  private int likesCount;
  private int starsCount;
  private boolean liked;
  private boolean starred;
  private List<GenreDTO> genres;

  public static PostWithUserDTO fromPost(Post post, String username, Integer level, boolean liked, boolean starred, List<GenreDTO> genres) {
    PostWithUserDTO dto = new PostWithUserDTO();
    dto.setId(post.getId());
    dto.setUserId(post.getUserId());
    dto.setUsername(username);
    dto.setLevel(level);
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
    dto.setGenres(genres != null ? genres : new ArrayList<>());
    return dto;
  }

  public static PostWithUserDTO fromPost(Post post, String username, Integer level, boolean liked, boolean starred) {
    return fromPost(post, username, level, liked, starred, new ArrayList<>());
  }

  public static PostWithUserDTO fromPost(Post post, String username, Integer level) {
    return fromPost(post, username, level, false, false, new ArrayList<>());
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