package com.realdeal.backend.post.controller;

import com.realdeal.backend.authentication.service.UserProfileService;
import com.realdeal.backend.exp.service.ExperienceService;
import com.realdeal.backend.post.exception.AccessDeniedException;
import com.realdeal.backend.genre.dto.GenreDTO;
import com.realdeal.backend.genre.dto.PostGenreAssignRequest;
import com.realdeal.backend.genre.model.Genre;
import com.realdeal.backend.genre.service.GenreService;
import com.realdeal.backend.post.dto.PostWithUserDTO;
import com.realdeal.backend.post.model.Post;
import com.realdeal.backend.post.service.PostService;
import com.realdeal.backend.post.service.ReactionService;
import com.realdeal.backend.post.repository.PostRepository;
import com.realdeal.backend.recommendation.service.RecommendationService;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
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
    private final PostRepository postRepo;
    private final GenreService genreService;
    private final RecommendationService recommendationService;

    private final ExperienceService experienceService;

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostWithUserDTO> createPost(
        @RequestParam String userId,
        @RequestParam String title,
        @RequestParam String content,
        @RequestPart("images") List<MultipartFile> images,
        @RequestParam(required = false) List<Integer> genreIds) {

        Post saved = postService.createPost(userId, title, content, images);

        // Assign genres if provided
        List<GenreDTO> genreDTOs = null;
        if (genreIds != null && !genreIds.isEmpty()) {
            genreService.assignGenresToPost(saved.getId(), genreIds);
            List<Genre> postGenres = genreService.getPostGenres(saved.getId());
            genreDTOs = postGenres.stream()
                .map(genre -> new GenreDTO(genre.getId(), genre.getName(), genre.getDescription()))
                .collect(Collectors.toList());
        }

        String username = userProfileService.getUsernameByUserId(userId);
        PostWithUserDTO dto = PostWithUserDTO.fromPost(saved, username, false, false, genreDTOs);
        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public ResponseEntity<Page<PostWithUserDTO>> getPosts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "9") int size,
        @RequestParam(required = false) String userId,
        @RequestParam(defaultValue = "0") int postsViewed) {

        // Get posts with pagination
        Page<Post> posts = postService.getPaginatedPosts(page, size);

        // Convert page content to a modifiable list
        List<Post> postList = new ArrayList<>(posts.getContent());

        // Apply recommendation logic if userId is provided
        if (userId != null) {
            postList = recommendationService.applyRecommendationLogic(postList, userId, postsViewed);
        }

        // Extract all userIds
        List<String> userIds = postList.stream()
            .map(Post::getUserId)
            .distinct()
            .collect(Collectors.toList());

        // Fetch all usernames in one batch
        Map<String, String> usernameMap = userProfileService.getUsernamesByUserIds(userIds);

        // Map posts to DTOs with usernames, reaction status, and genres
        List<PostWithUserDTO> postDTOs = postList.stream()
            .map(post -> {
                String username = usernameMap.getOrDefault(post.getUserId(), "Unknown User");
                boolean liked = false;
                boolean starred = false;

                // Check if the current user has liked or starred this post
                if (userId != null) {
                    liked = reactionService.hasLiked(post.getId(), userId);
                    starred = reactionService.hasStarred(post.getId(), userId);
                }

                // Get genres for this post
                List<Genre> postGenres = genreService.getPostGenres(post.getId());
                List<GenreDTO> genreDTOs = postGenres.stream()
                    .map(genre -> new GenreDTO(genre.getId(), genre.getName(), genre.getDescription()))
                    .collect(Collectors.toList());

                return PostWithUserDTO.fromPost(post, username, liked, starred, genreDTOs);
            })
            .collect(Collectors.toList());

        Page<PostWithUserDTO> postDTOPage = new PageImpl<>(
            postDTOs,
            posts.getPageable(),
            posts.getTotalElements()
        );

        return ResponseEntity.ok(postDTOPage);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<PostWithUserDTO>> getPostsByUserId(
        @PathVariable String userId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "9") int size,
        @RequestParam(required = false) String currentUserId) {

        // Get posts for the specified user with pagination
        Page<Post> posts = postService.getPostsByUserId(userId, page, size);

        // Extract all usernames needed for these posts
        List<String> userIds = posts.getContent().stream()
            .map(Post::getUserId)
            .distinct()
            .collect(Collectors.toList());

        // Fetch all usernames in one batch
        Map<String, String> usernameMap = userProfileService.getUsernamesByUserIds(userIds);

        // Map posts to DTOs with usernames, reaction status, and genres
        List<PostWithUserDTO> postDTOs = posts.getContent().stream()
            .map(post -> {
                String username = usernameMap.getOrDefault(post.getUserId(), "Unknown User");
                boolean liked = false;
                boolean starred = false;

                // Check if the current user has liked or starred this post
                if (currentUserId != null) {
                    liked = reactionService.hasLiked(post.getId(), currentUserId);
                    starred = reactionService.hasStarred(post.getId(), currentUserId);
                }

                // Get genres for this post
                List<Genre> postGenres = genreService.getPostGenres(post.getId());
                List<GenreDTO> genreDTOs = postGenres.stream()
                    .map(genre -> new GenreDTO(genre.getId(), genre.getName(), genre.getDescription()))
                    .collect(Collectors.toList());

                return PostWithUserDTO.fromPost(post, username, liked, starred, genreDTOs);
            })
            .collect(Collectors.toList());

        Page<PostWithUserDTO> postDTOPage = new PageImpl<>(
            postDTOs,
            posts.getPageable(),
            posts.getTotalElements()
        );

        return ResponseEntity.ok(postDTOPage);
    }

    @PutMapping("/{postId}")
    public ResponseEntity<PostWithUserDTO> editPost(
        @PathVariable UUID postId,
        @RequestParam String userId,
        @RequestParam String title,
        @RequestParam String content) {

        // Verify the user owns this post before updating
        Post post = postRepo.findById(postId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        // Security check - only post owner can edit
        if (!post.getUserId().equals(userId)) {
            throw new AccessDeniedException("You can only edit your own posts");
        }

        // Update the post
        Post updatedPost = postService.updatePost(postId, title, content);

        // Get username
        String username = userProfileService.getUsernameByUserId(userId);

        // Get genres for this post
        List<Genre> postGenres = genreService.getPostGenres(postId);
        List<GenreDTO> genreDTOs = postGenres.stream()
            .map(genre -> new GenreDTO(genre.getId(), genre.getName(), genre.getDescription()))
            .collect(Collectors.toList());

        // Check reaction status
        boolean liked = reactionService.hasLiked(postId, userId);
        boolean starred = reactionService.hasStarred(postId, userId);

        PostWithUserDTO dto = PostWithUserDTO.fromPost(updatedPost, username, liked, starred, genreDTOs);
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(
        @PathVariable UUID postId,
        @RequestParam String userId) {

        // Verify the user owns this post before deleting
        Post post = postRepo.findById(postId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        // Security check - only post owner can delete
        if (!post.getUserId().equals(userId)) {
            throw new AccessDeniedException("You can only delete your own posts");
        }

        // Delete the post
        postService.deletePost(postId);

        return ResponseEntity.ok(Map.of(
            "message", "Post deleted successfully",
            "postId", postId
        ));
    }

    @PutMapping("/{postId}/genres")
    public ResponseEntity<List<GenreDTO>> updatePostGenres(
        @PathVariable UUID postId,
        @RequestBody PostGenreAssignRequest request) {

        genreService.assignGenresToPost(postId, request.getGenreIds());
        List<Genre> postGenres = genreService.getPostGenres(postId);

        List<GenreDTO> genreDTOs = postGenres.stream()
            .map(genre -> new GenreDTO(genre.getId(), genre.getName(), genre.getDescription()))
            .collect(Collectors.toList());

        return ResponseEntity.ok(genreDTOs);
    }

    @PostMapping("/{postId}/like")
    @Transactional
    public ResponseEntity<?> like(@PathVariable UUID postId,
        @RequestParam String userId) {

        boolean liked = reactionService.toggleLike(postId, userId);
        int count = postRepo.findById(postId).orElseThrow().getLikesCount();
        return ResponseEntity.ok(Map.of("liked", liked, "likes", count));
    }

    @PostMapping("/{postId}/star")
    @Transactional
    public ResponseEntity<?> star(@PathVariable UUID postId,
        @RequestParam String userId) {

        boolean starred = reactionService.toggleStar(postId, userId);
        int count = postRepo.findById(postId).orElseThrow().getStarsCount();
        return ResponseEntity.ok(Map.of("starred", starred, "stars", count));
    }

    @GetMapping("/liked/{userId}")
    public ResponseEntity<Page<PostWithUserDTO>> liked(
        @PathVariable String userId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "9") int size,
        @RequestParam(required = false) String currentUserId) {

        Page<Post> posts = postService.getLikedPosts(userId, page, size);
        return ResponseEntity.ok(toDtoPage(posts, currentUserId));
    }

    /* =======================================================================
     *                    NEW   /starred/{userId}
     * ======================================================================= */
    @GetMapping("/starred/{userId}")
    public ResponseEntity<Page<PostWithUserDTO>> starred(
        @PathVariable String userId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "9") int size,
        @RequestParam(required = false) String currentUserId) {

        Page<Post> posts = postService.getStarredPosts(userId, page, size);
        return ResponseEntity.ok(toDtoPage(posts, currentUserId));
    }

    @GetMapping("/search/posts")    //  ← unique, constant path
    public Page<PostWithUserDTO> search(
        @RequestParam String q,
        @RequestParam(defaultValue="0") int page,
        @RequestParam(defaultValue="9") int size,
        @RequestParam(required=false) String currentUserId) {

        Page<Post> result = postService.search(q, page, size);
        return toDtoPage(result, currentUserId);
    }

    /* ---------------------------------------------------------------------
       shared helper that maps Post → PostWithUserDTO (genres + reactions)
       ------------------------------------------------------------------- */
    private Page<PostWithUserDTO> toDtoPage(Page<Post> posts, String viewerId) {

        /* batch-lookup usernames */
        Map<String, String> usernameMap = userProfileService
            .getUsernamesByUserIds(
                posts.getContent().stream()
                    .map(Post::getUserId)
                    .distinct()
                    .toList());

        List<PostWithUserDTO> dtoList = posts.getContent().stream().map(p -> {

            String username = usernameMap.getOrDefault(p.getUserId(), "Unknown User");
            boolean liked = false, starred = false;

            if (viewerId != null) {
                liked   = reactionService.hasLiked  (p.getId(), viewerId);
                starred = reactionService.hasStarred(p.getId(), viewerId);
            }

            List<GenreDTO> genres = genreService.getPostGenres(p.getId()).stream()
                .map(g -> new GenreDTO(g.getId(), g.getName(), g.getDescription()))
                .collect(Collectors.toList());

            return PostWithUserDTO.fromPost(p, username, liked, starred, genres);
        }).toList();

        return new PageImpl<>(dtoList, posts.getPageable(), posts.getTotalElements());
    }


}