package com.realdeal.backend.post.service;

import com.realdeal.backend.post.model.Comment;
import com.realdeal.backend.post.model.CommentLike;
import com.realdeal.backend.post.model.pk.CommentLikePK;
import com.realdeal.backend.post.repository.CommentLikeRepository;
import com.realdeal.backend.post.repository.CommentRepository;
import com.realdeal.backend.post.service.CommentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CommentServiceTest {

    @Mock private CommentRepository      commentRepo;
    @Mock private CommentLikeRepository  likeRepo;
    @InjectMocks private CommentService  commentService;

    private UUID commentId;
    private String userId;

    @BeforeEach
    void init() { MockitoAnnotations.openMocks(this);
        commentId = UUID.randomUUID(); userId = "u1";
    }

    @Test
    void toggleLike_addsLike_whenNotExists() {
        when(likeRepo.existsById(any(CommentLikePK.class))).thenReturn(false);
        boolean liked = commentService.toggleCommentLike(commentId, userId);
        assertTrue(liked);
        verify(likeRepo).save(any(CommentLike.class));
        verify(commentRepo).incrementLikes(commentId);
    }

    @Test
    void toggleLike_removesLike_whenExists() {
        when(likeRepo.existsById(any(CommentLikePK.class))).thenReturn(true);
        boolean liked = commentService.toggleCommentLike(commentId, userId);
        assertFalse(liked);
        verify(likeRepo).deleteById(any(CommentLikePK.class));
        verify(commentRepo).decrementLikes(commentId);
    }
}
