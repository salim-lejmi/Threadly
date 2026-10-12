package com.example.server.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "thread_id"}))
public class ThreadLike {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "thread_id")
    private Thread thread;
}