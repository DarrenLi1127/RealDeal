package com.realdeal.backend.post.controller;

import com.realdeal.backend.authentication.service.UserProfileService;
import com.realdeal.backend.post.dto.PostWithUserDTO;
import com.realdeal.backend.post.model.Post;
import com.realdeal.backend.post.service.PostService;
import com.realdeal.backend.post.service.ReactionService;
import com.realdeal.backend.post.repository.PostRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;



import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.UUID;



@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final UserProfileService userProfileService;

    private final ReactionService reactionService;
    private final PostRepository  postRepo;

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostWithUserDTO> createPost(@RequestParam String userId,
        @RequestParam String title,
        @RequestParam String content,
        @RequestPart("images") List<MultipartFile> images) {

        Post saved = postService.createPost(userId, title, content, images);
        String username = userProfileService.getUsernameByUserId(userId);
        PostWithUserDTO dto = PostWithUserDTO.fromPost(saved, username);
        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public ResponseEntity<Page<PostWithUserDTO>> getPosts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "9") int size) {

        Page<Post> posts = postService.getPaginatedPosts(page, size);

        // Extract all userIds
        List<String> userIds = posts.getContent().stream()
            .map(Post::getUserId)
            .distinct()
            .collect(Collectors.toList());

        // Fetch all usernames in one batch
        Map<String, String> usernameMap = userProfileService.getUsernamesByUserIds(userIds);

        // Map posts to DTOs with usernames
        List<PostWithUserDTO> postDTOs = posts.getContent().stream()
            .map(post -> {
                String username = usernameMap.getOrDefault(post.getUserId(), "Unknown User");
                return PostWithUserDTO.fromPost(post, username);
            })
            .collect(Collectors.toList());

        Page<PostWithUserDTO> postDTOPage = new PageImpl<>(
            postDTOs,
            posts.getPageable(),
            posts.getTotalElements()
        );

        return ResponseEntity.ok(postDTOPage);
    }

    @PostMapping("/{postId}/like")
    @Transactional
    public ResponseEntity<?> like(@PathVariable UUID postId,
        @RequestParam String userId) {

        boolean liked = reactionService.toggleLike(postId, userId);
        int     count = postRepo.findById(postId).orElseThrow().getLikesCount();
        return ResponseEntity.ok(Map.of("liked", liked, "likes", count));
    }

    @PostMapping("/{postId}/star")
    @Transactional
    public ResponseEntity<?> star(@PathVariable UUID postId,
        @RequestParam String userId) {

        boolean starred = reactionService.toggleStar(postId, userId);
        int     count   = postRepo.findById(postId).orElseThrow().getStarsCount();
        return ResponseEntity.ok(Map.of("starred", starred, "stars", count));
    }

}