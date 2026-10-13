package com.example.server.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Entity
@Data
public class Thread {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long threadId;

    private String title;

    private String category;

    private Long price;

    private String city;

    private String threadText;

    private Date threadDate = new Date();

    private Long threadLikes;

    private Long threadRetweets;

    private String imageUrl;

    @ManyToOne
    @JoinColumn(name = "created_by_id")
    private User createdBy;
}