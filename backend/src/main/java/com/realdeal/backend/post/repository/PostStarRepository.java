package com.realdeal.backend.post.repository;

import com.realdeal.backend.post.model.PostStar;
import com.realdeal.backend.post.model.pk.PostStarPK;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PostStarRepository extends JpaRepository<PostStar, PostStarPK> {
    long    countByPostId(UUID postId);
    boolean existsByPostIdAndUserId(UUID postId, String userId);
}
