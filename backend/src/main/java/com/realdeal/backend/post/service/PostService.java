package com.realdeal.backend.post.service;

import com.realdeal.backend.exp.service.ExperienceService;
import com.realdeal.backend.post.model.Post;
import com.realdeal.backend.post.model.PostImage;
import com.realdeal.backend.post.repository.PostRepository;
import com.realdeal.backend.storage.service.UploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.util.UUID;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepo;
    private final UploadService uploadService;
    private final ExperienceService experienceService;

    @Caching(evict = {
        @CacheEvict(cacheNames = "postsContent", allEntries = true),
        @CacheEvict(cacheNames = "postsCount", allEntries = true),
        @CacheEvict(cacheNames = "userPostsContent", allEntries = true),
        @CacheEvict(cacheNames = "userPostsCount", allEntries = true)
    })
    public Post createPost(String userId,
        String title,
        String content,
        List<MultipartFile> images) {

        validate(userId, title, content, images);

        Post post = new Post();
        post.setUserId(userId);
        post.setTitle(title.trim());
        post.setContent(content.trim());

        // upload & attach
        IntStream.range(0, images.size()).forEach(i -> {
            String url = uploadService.uploadToS3(images.get(i));   // existing uploader
            PostImage pi = new PostImage();
            pi.setPost(post);
            pi.setPosition(i);
            pi.setUrl(url);
            post.getImages().add(pi);
        });

        experienceService.addExp(userId, 15);

        return postRepo.save(post);
    }

    @Cacheable(cacheNames = "allPosts")
    public List<Post> listAll() {
        return postRepo.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    // Method that builds a Page from separately cached components
    public Page<Post> getPaginatedPosts(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<Post> content = getPostsContent(page, size);
        long total = getPostsCount();
        return new PageImpl<>(content, pageRequest, total);
    }

    // Cache the content separately
    @Cacheable(cacheNames = "postsContent", key = "'page:' + #page + ':size:' + #size")
    public List<Post> getPostsContent(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return postRepo.findAll(pageRequest).getContent();
    }

    // Cache the count separately
    @Cacheable(cacheNames = "postsCount")
    public long getPostsCount() {
        return postRepo.count();
    }

    @Cacheable(cacheNames = "singlePost", key = "#postId")
    public Post getPostById(UUID postId) {
        return postRepo.findById(postId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
    }

    private void validate(String userId,
        String title,
        String content,
        List<MultipartFile> images) {

        if (userId == null || userId.isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId required");

        if (title == null || title.isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title required");

        if (content == null || content.isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "content required");

        if (images == null || images.isEmpty())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "at least one image required");
    }

    /**
     * Get posts by user ID with pagination
     * This method splits caching of content and count to avoid PageImpl serialization issues
     */
    public Page<Post> getPostsByUserId(String userId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<Post> content = getUserPostsContent(userId, page, size);
        long count = getUserPostsCount(userId);
        return new PageImpl<>(content, pageRequest, count);
    }

    /**
     * Cache only the content for user posts
     */
    @Cacheable(cacheNames = "userPostsContent", key = "#userId + ':page:' + #page + ':size:' + #size")
    public List<Post> getUserPostsContent(String userId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return postRepo.findByUserId(userId, pageRequest).getContent();
    }

    /**
     * Cache only the count for user posts
     */
    @Cacheable(cacheNames = "userPostsCount", key = "#userId")
    public long getUserPostsCount(String userId) {
        return postRepo.countByUserId(userId);
    }

    /**
     * Update an existing post (title and content only)
     */
    @Caching(evict = {
        @CacheEvict(cacheNames = "postsContent", allEntries = true),
        @CacheEvict(cacheNames = "singlePost", key = "#postId"),
        @CacheEvict(cacheNames = "allPosts", allEntries = true),
        @CacheEvict(cacheNames = "userPostsContent", allEntries = true),
        @CacheEvict(cacheNames = "userPostsCount", allEntries = true)
    })
    public Post updatePost(UUID postId, String title, String content) {
        // Validate input
        if (title == null || title.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title required");
        }
        if (content == null || content.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "content required");
        }

        // Get the post
        Post post = postRepo.findById(postId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        // Update fields
        post.setTitle(title.trim());
        post.setContent(content.trim());

        // Save and return
        return postRepo.save(post);
    }

    /**
     * Delete a post
     */
    @Caching(evict = {
        @CacheEvict(cacheNames = "postsContent", allEntries = true),
        @CacheEvict(cacheNames = "postsCount", allEntries = true),
        @CacheEvict(cacheNames = "singlePost", key = "#postId"),
        @CacheEvict(cacheNames = "allPosts", allEntries = true),
        @CacheEvict(cacheNames = "userPostsContent", allEntries = true),
        @CacheEvict(cacheNames = "userPostsCount", allEntries = true),
        @CacheEvict(cacheNames = "topLevelComments", allEntries = true),
        @CacheEvict(cacheNames = "allComments", allEntries = true)
    })
    public void deletePost(UUID postId) {
        if (!postRepo.existsById(postId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
        }

        postRepo.deleteById(postId);
    }
}