package com.realdeal.backend.post.repository;

import com.realdeal.backend.post.model.PostLike;
import com.realdeal.backend.post.model.pk.PostLikePK;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, PostLikePK> {
    long    countByPostId(UUID postId);
    boolean existsByPostIdAndUserId(UUID postId, String userId);
}
