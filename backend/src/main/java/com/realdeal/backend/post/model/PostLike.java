package com.realdeal.backend.post.model;

import com.realdeal.backend.post.model.pk.PostLikePK;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "post_likes")
@IdClass(PostLikePK.class)
public class PostLike {

    @Id
    private UUID postId;

    @Id
    private String userId;

    private LocalDateTime createdAt = LocalDateTime.now();
}
