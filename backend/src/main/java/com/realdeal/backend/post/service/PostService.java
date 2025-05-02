package com.realdeal.backend.post.service;

import com.realdeal.backend.exp.service.ExperienceService;
import com.realdeal.backend.post.model.Post;
import com.realdeal.backend.post.model.PostImage;
import com.realdeal.backend.post.repository.PostRepository;
import com.realdeal.backend.storage.service.UploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepo;
    private final UploadService  uploadService;
    private final ExperienceService experienceService;

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

    public List<Post> listAll() {
        return postRepo.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public Page<Post> getPaginatedPosts(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return postRepo.findAll(pageRequest);
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
}