package com.realdeal.backend.post.service;

import com.realdeal.backend.post.model.Post;
import com.realdeal.backend.post.repository.PostRepository;
import com.realdeal.backend.storage.service.UploadService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.data.domain.*;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PostServiceTest {

    @Mock  private PostRepository postRepo;
    @Mock  private UploadService  uploadService;
    @InjectMocks private PostService postService;

    @BeforeEach void init() { MockitoAnnotations.openMocks(this); }

    @Test
    void createPost_savesPostWithImages() {
        when(uploadService.uploadToS3(any())).thenReturn("url");
        when(postRepo.save(any(Post.class)))
            .thenAnswer(inv -> inv.getArgument(0));

        Post result = postService.createPost("u1", "t", "c",
            List.of(mock(org.springframework.web.multipart.MultipartFile.class)));

        assertEquals("u1", result.getUserId());
        assertEquals("t",  result.getTitle());
        verify(uploadService).uploadToS3(any());
        verify(postRepo).save(result);
    }

    @Test
    void getPaginatedPosts_delegatesToRepo() {
        Page<Post> empty = new PageImpl<>(List.of());
        when(postRepo.findAll(any(Pageable.class))).thenReturn(empty);

        Page<Post> page = postService.getPaginatedPosts(0, 9);
        assertSame(empty, page);
    }
}
