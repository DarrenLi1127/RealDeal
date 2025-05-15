package com.realdeal.backend.post.service;

import com.realdeal.backend.exp.service.ExperienceService;
import com.realdeal.backend.post.model.PostLike;
import com.realdeal.backend.post.model.PostStar;
import com.realdeal.backend.post.model.pk.PostLikePK;
import com.realdeal.backend.post.model.pk.PostStarPK;
import com.realdeal.backend.post.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ReactionService {

    private final PostLikeRepository likeRepo;
    private final PostStarRepository starRepo;
    private final PostRepository postRepo;
    private final ExperienceService experienceService;

    private static final int EXP_PER_REACTION = 2;

    @Caching(evict = {
        @CacheEvict(cacheNames = "postsContent", allEntries = true),
        @CacheEvict(cacheNames = "postLikes", key = "#postId + ':' + #userId"),
        @CacheEvict(cacheNames = "allPosts", allEntries = true), // Added to ensure consistency
        @CacheEvict(cacheNames = "singlePost", key = "#postId") // Added to ensure consistency
    })
    public boolean toggleLike(UUID postId, String userId) {
        PostLikePK pk = new PostLikePK(postId, userId);
        if (likeRepo.existsById(pk)) {                 // reaction removed
            likeRepo.deleteById(pk);
            postRepo.decrementLikes(postId);

            String ownerId = postRepo.findById(postId).orElseThrow().getUserId();
            if (!ownerId.equals(userId)) {
                experienceService.addExp(ownerId, -EXP_PER_REACTION);   // ← deduct EXP
            }
            return false;
        } else {
            PostLike like = new PostLike();
            like.setPostId(postId);
            like.setUserId(userId);
            likeRepo.save(like);
            postRepo.incrementLikes(postId);

            String ownerId = postRepo.findById(postId).orElseThrow()
                .getUserId();
            if (!ownerId.equals(userId)) {
                experienceService.addExp(ownerId, EXP_PER_REACTION);
            }

            return true;
        }
    }

    @Caching(evict = {
        @CacheEvict(cacheNames = "postsContent", allEntries = true),
        @CacheEvict(cacheNames = "postStars", key = "#postId + ':' + #userId"),
        @CacheEvict(cacheNames = "allPosts", allEntries = true), // Added to ensure consistency
        @CacheEvict(cacheNames = "singlePost", key = "#postId") // Added to ensure consistency
    })
    public boolean toggleStar(UUID postId, String userId) {
        PostStarPK pk = new PostStarPK(postId, userId);
        if (starRepo.existsById(pk)) {                 // reaction removed
            starRepo.deleteById(pk);
            postRepo.decrementStars(postId);

            String ownerId = postRepo.findById(postId).orElseThrow().getUserId();
            if (!ownerId.equals(userId)) {             // skip self-unstar
                experienceService.addExp(ownerId, -EXP_PER_REACTION);   // ← deduct EXP
            }
            return false;
        } else {
            PostStar star = new PostStar();
            star.setPostId(postId);
            star.setUserId(userId);
            starRepo.save(star);
            postRepo.incrementStars(postId);

            String ownerId = postRepo.findById(postId).orElseThrow()
                .getUserId();
            if (!ownerId.equals(userId)) {
                experienceService.addExp(ownerId, EXP_PER_REACTION);
            }

            return true;
        }
    }

    @Cacheable(cacheNames = "postLikes", key = "#postId + ':' + #userId")
    public boolean hasLiked(UUID postId, String userId) {
        return likeRepo.existsByPostIdAndUserId(postId, userId);
    }

    @Cacheable(cacheNames = "postStars", key = "#postId + ':' + #userId")
    public boolean hasStarred(UUID postId, String userId) {
        return starRepo.existsByPostIdAndUserId(postId, userId);
    }
}