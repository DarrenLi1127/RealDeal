package com.realdeal.backend.post.controller;

import com.realdeal.backend.post.model.Post;
import com.realdeal.backend.post.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    /* ---------- CREATE ---------- */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Post> createPost(@RequestParam String userId,
        @RequestParam String title,
        @RequestParam String content,
        @RequestPart("images") List<MultipartFile> images) {

        Post saved = postService.createPost(userId, title, content, images);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    /* ---------- READ (simple feed) ---------- */
    @GetMapping
    public ResponseEntity<List<Post>> listPosts() {
        return ResponseEntity.ok(postService.listAll());
    }
}
