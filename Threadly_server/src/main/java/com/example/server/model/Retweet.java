package com.example.server.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;

@Entity
@Data
@Table(uniqueConstraints = {
        @UniqueConstraint(columnNames = {"retweeted_by_id", "thread_id"}),
        @UniqueConstraint(columnNames = {"retweeted_by_id", "reply_id"})
})
public class Retweet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long retweetId;

    @ManyToOne
    @JoinColumn(name = "retweeted_by_id")
    private User retweetedBy;

    @ManyToOne
    @JoinColumn(name = "thread_id")
    private Thread thread;

    @ManyToOne
    @JoinColumn(name = "reply_id")
    private Reply reply;

    private Date retweetDate = new Date();
}