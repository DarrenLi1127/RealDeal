package com.realdeal.backend.recommendation.service;

import com.realdeal.backend.genre.model.Genre;
import com.realdeal.backend.genre.service.GenreService;
import com.realdeal.backend.post.model.Post;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

  private final GenreService genreService;

  public List<Post> applyRecommendationLogic(List<Post> posts, String userId, int postsViewed) {
    if (userId == null || posts.isEmpty()) {
      return posts;
    }

    List<Genre> userGenres = genreService.getUserGenres(userId);

    if (userGenres.isEmpty()) {
      return posts;
    }

    List<Integer> preferredGenreIds = userGenres.stream()
        .map(Genre::getId)
        .collect(Collectors.toList());

    // As the user views more posts, personalization becomes weaker.
    // 看得越多，个性化越少 （0， 1）
    double decay = Math.min(1.0, postsViewed / 50.0);

    // Create a map to store posts and their weights
    Map<Post, Double> weightedPosts = new HashMap<>();

    for (Post post : posts) {
      // Get post genres
      List<Genre> postGenres = genreService.getPostGenres(post.getId());
      List<Integer> postGenreIds = postGenres.stream()
          .map(Genre::getId)
          .collect(Collectors.toList());

      // Calculate weight based on genre overlap and decay
      double weight = calculateWeight(preferredGenreIds, postGenreIds, decay);
      weightedPosts.put(post, weight);
    }

    // 按照权重和发布时间（降序）排序帖子
    return weightedPosts.entrySet().stream()
        .sorted((e1, e2) -> {
          int weightCompare = Double.compare(e2.getValue(), e1.getValue());
          //lamda，< 0则 a< b, = 0 则相等， > 0 则a > b, java sort 根据大小排列
          if (weightCompare != 0) {
            return weightCompare;
          }
          // 如果相等，正常排序
          return e2.getKey().getCreatedAt().compareTo(e1.getKey().getCreatedAt());
        })
        .map(Map.Entry::getKey)
        .collect(Collectors.toList());
  }

  private double calculateWeight(List<Integer> preferredGenreIds, List<Integer> postGenreIds, double decay) {
    // 找intersection，看有多少个genre重叠
    Set<Integer> intersection = new HashSet<>(preferredGenreIds);
    intersection.retainAll(postGenreIds);

    // Calculate weight based on genre overlap and decay
    if (intersection.isEmpty()) {
      // No genre match - use low weight that increases with decay
      return 0.1 + (0.9 * decay);
    } else {
      // Genre match （genre重叠）
      // Weight starts high and decreases with decay
      // 计算这个post和用户喜欢的genre的重叠度
      double matchRatio = (double) intersection.size() / preferredGenreIds.size();
      //优先match当decay比较低，到最后所有都是1
      return matchRatio * (1.0 - decay) + decay;
    }
  }
}