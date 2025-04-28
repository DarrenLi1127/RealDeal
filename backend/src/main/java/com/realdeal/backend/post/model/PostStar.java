package com.realdeal.backend.post.model;

import com.realdeal.backend.post.model.pk.PostStarPK;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "post_stars")
@IdClass(PostStarPK.class)
public class PostStar {

    @Id
    private UUID postId;

    @Id
    private String userId;

    private LocalDateTime createdAt = LocalDateTime.now();
}
