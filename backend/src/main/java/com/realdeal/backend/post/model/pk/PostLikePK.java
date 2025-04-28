package com.realdeal.backend.post.model.pk;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostLikePK implements Serializable {
    private UUID   postId;
    private String userId;
}
