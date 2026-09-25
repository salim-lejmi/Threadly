package com.example.server.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;

@Entity
@Data
public class Follow {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long followId;

    @ManyToOne
    @JoinColumn(name = "follower_id")
    private User follower;

    @ManyToOne
    @JoinColumn(name = "following_id")
    private User following;

    private Date followDate = new Date();
}