package com.realdeal.backend.post.controller;

import com.realdeal.backend.authentication.service.UserProfileService;
import com.realdeal.backend.genre.dto.GenreDTO;
import com.realdeal.backend.genre.dto.PostGenreAssignRequest;
import com.realdeal.backend.genre.model.Genre;
import com.realdeal.backend.genre.service.GenreService;
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
    private final PostRepository postRepo;
    private final GenreService genreService;

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
        @RequestParam(required = false) String userId) {

        Page<Post> posts = postService.getPaginatedPosts(page, size);

        // Extract all userIds
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
}