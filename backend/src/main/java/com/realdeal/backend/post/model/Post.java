package com.realdeal.backend.post.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Entity @Table(name = "posts")
public class Post {

    @Id @GeneratedValue
    private UUID id;

    @Column(nullable = false, length = 50)
    private String userId;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @JsonManagedReference
    //Marks the parent side of the relationship.
    //The field with this annotation will be serialized normally.
    @OneToMany(mappedBy = "post",
        cascade = CascadeType.ALL,
        orphanRemoval = true)
    @OrderBy("position ASC")             // maintain upload order
    private List<PostImage> images = new ArrayList<>();

    @Column(nullable = false)
    private int likesCount = 0;

    @Column(nullable = false)
    private int starsCount = 0;

    private LocalDateTime createdAt = LocalDateTime.now();
}
