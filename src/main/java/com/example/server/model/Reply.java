package com.example.server.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;

@Entity
@Data
public class Reply {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long replyId;

    private String replyText;

    private Date replyDate = new Date();
    private Number replyLikes;
    @ManyToOne
    @JoinColumn(name = "thread_id")
    private Thread thread;

    @ManyToOne
    @JoinColumn(name = "created_by_id")
    private User createdBy;
}