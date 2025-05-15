package com.realdeal.backend.post.service;

import com.realdeal.backend.exp.service.ExperienceService;
import com.realdeal.backend.post.model.Post;
import com.realdeal.backend.post.repository.PostRepository;
import com.realdeal.backend.storage.service.UploadService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock private PostRepository postRepo;
    @Mock private UploadService uploadService;
    @Mock private ExperienceService experienceService;

    @InjectMocks
    private PostService postService;

    @Test
    void createPost_savesPostWithImages() {
        when(uploadService.uploadToS3(any())).thenReturn("url");
        when(postRepo.save(any(Post.class)))
            .thenAnswer(inv -> inv.getArgument(0));

        Post saved = postService.createPost(
            "u1", "title", "content", List.of(mock(org.springframework.web.multipart.MultipartFile.class)));

        assertEquals("u1", saved.getUserId());
        verify(uploadService).uploadToS3(any());
        verify(postRepo).save(saved);
        verify(experienceService).addExp(eq("u1"), anyInt());
    }

    @Test
    void getPaginatedPosts_delegatesToRepo() {
        Post p = new Post();
        Page<Post> expected = new PageImpl<>(List.of(p));
        Pageable pageReq = PageRequest.of(0, 9, Sort.by(Sort.Direction.DESC, "createdAt"));

        when(postRepo.findAll(pageReq)).thenReturn(expected);

        Page<Post> actual = postService.getPaginatedPosts(0, 9);
        assertEquals(expected.getContent(), actual.getContent());
    }
}
