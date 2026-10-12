package com.example.server.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "reply_id"}))
public class ReplyLike {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "reply_id")
    private Reply reply;
}