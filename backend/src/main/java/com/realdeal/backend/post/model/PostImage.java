package com.realdeal.backend.post.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonBackReference;
import java.util.UUID;

@Data
@Entity @Table(name = "post_images")
public class PostImage {

    @Id @GeneratedValue
    private UUID id;

    @JsonBackReference
    //Marks the child side of the relationship.
    //The field with this annotation will be omitted from serialization.
    @ManyToOne(fetch = FetchType.LAZY)
    private Post post;

    private int position;

    @Column(nullable = false, length = 2048)
    private String url;
}