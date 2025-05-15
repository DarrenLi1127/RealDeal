package com.realdeal.backend.post.service;

import com.realdeal.backend.exp.service.ExperienceService;
import com.realdeal.backend.post.model.Post;
import com.realdeal.backend.post.model.PostLike;
import com.realdeal.backend.post.model.PostStar;
import com.realdeal.backend.post.model.pk.PostLikePK;
import com.realdeal.backend.post.model.pk.PostStarPK;
import com.realdeal.backend.post.repository.PostLikeRepository;
import com.realdeal.backend.post.repository.PostRepository;
import com.realdeal.backend.post.repository.PostStarRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReactionServiceTest {

    @Mock  private PostLikeRepository likeRepo;
    @Mock  private PostStarRepository starRepo;
    @Mock  private PostRepository     postRepo;
    @Mock  private ExperienceService experienceService;

    @InjectMocks
    private ReactionService reactionService;

    private UUID   postId;
    private String ownerId;
    private String otherUserId;
    private Post   post;

    @BeforeEach
    void init() {
        postId      = UUID.randomUUID();
        ownerId     = "owner-123";
        otherUserId = "user-456";

        post = new Post();
        post.setUserId(ownerId);

        when(postRepo.findById(postId)).thenReturn(Optional.of(post));
    }

    /* ---------- LIKE ---------- */

    @Test
    void toggleLike_addsLikeAndAwardsExp_whenNotLiked() {
        // not liked yet
        when(likeRepo.existsById(any(PostLikePK.class))).thenReturn(false);

        boolean liked = reactionService.toggleLike(postId, otherUserId);

        assertTrue(liked);
        verify(likeRepo).save(any(PostLike.class));
        verify(postRepo).incrementLikes(postId);
        verify(experienceService).addExp(ownerId, 2);   // +EXP to owner
    }

    @Test
    void toggleLike_removesLikeAndDeductsExp_whenAlreadyLiked() {
        when(likeRepo.existsById(any(PostLikePK.class))).thenReturn(true);

        boolean liked = reactionService.toggleLike(postId, otherUserId);

        assertFalse(liked);
        verify(likeRepo).deleteById(any(PostLikePK.class));
        verify(postRepo).decrementLikes(postId);
        verify(experienceService).addExp(ownerId, -2);  // –EXP from owner
    }

    @Test
    void toggleLike_neverChangesExp_whenUserLikesOwnPost() {
        when(likeRepo.existsById(any(PostLikePK.class))).thenReturn(false);

        reactionService.toggleLike(postId, ownerId);

        verify(experienceService, never()).addExp(anyString(), anyInt());
    }

    /* ---------- STAR ---------- */

    @Test
    void toggleStar_addsStarAndAwardsExp_whenNotStarred() {
        when(starRepo.existsById(any(PostStarPK.class))).thenReturn(false);

        boolean starred = reactionService.toggleStar(postId, otherUserId);

        assertTrue(starred);
        verify(starRepo).save(any(PostStar.class));
        verify(postRepo).incrementStars(postId);
        verify(experienceService).addExp(ownerId, 2);
    }

    @Test
    void toggleStar_removesStarAndDeductsExp_whenAlreadyStarred() {
        when(starRepo.existsById(any(PostStarPK.class))).thenReturn(true);

        boolean starred = reactionService.toggleStar(postId, otherUserId);

        assertFalse(starred);
        verify(starRepo).deleteById(any(PostStarPK.class));
        verify(postRepo).decrementStars(postId);
        verify(experienceService).addExp(ownerId, -2);
    }
}
