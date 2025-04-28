package com.realdeal.backend.post.service;

import com.realdeal.backend.post.model.pk.PostLikePK;
import com.realdeal.backend.post.model.pk.PostStarPK;
import com.realdeal.backend.post.repository.*;
import com.realdeal.backend.post.model.PostLike;
import com.realdeal.backend.post.model.PostStar;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ReactionService {

    private final PostLikeRepository likeRepo;
    private final PostStarRepository starRepo;
    private final PostRepository     postRepo;

    /* -------- like -------- */
    public boolean toggleLike(UUID postId, String userId) {
        PostLikePK pk = new PostLikePK(postId, userId);

        if (likeRepo.existsById(pk)) {          // currently liked → remove
            likeRepo.deleteById(pk);
            postRepo.decrementLikes(postId);
            return false;                       // now un-liked
        } else {                                // not liked yet → add
            PostLike like = new PostLike();
            like.setPostId(postId);
            like.setUserId(userId);
            likeRepo.save(like);

            postRepo.incrementLikes(postId);
            return true;                        // now liked
        }
    }

    /* -------- star -------- */
    public boolean toggleStar(UUID postId, String userId) {
        PostStarPK pk = new PostStarPK(postId, userId);

        if (starRepo.existsById(pk)) {
            starRepo.deleteById(pk);
            postRepo.decrementStars(postId);
            return false;
        } else {
            PostStar star = new PostStar();
            star.setPostId(postId);
            star.setUserId(userId);
            starRepo.save(star);

            postRepo.incrementStars(postId);
            return true;
        }
    }

    /* helpers for feed DTOs */
    public boolean likedByUser(UUID postId, String userId) {
        return likeRepo.existsByPostIdAndUserId(postId, userId);
    }
    public boolean starredByUser(UUID postId, String userId) {
        return starRepo.existsByPostIdAndUserId(postId, userId);
    }
}
