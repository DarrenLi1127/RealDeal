package com.realdeal.backend.post.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Data
@Entity @Table(name = "post_images")
public class PostImage {

    @Id @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Post post;

    /** order of the image in the carousel */
    private int position;

    @Column(nullable = false, length = 2048)
    private String url;
}