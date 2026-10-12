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

    private String threadText;

    private Date threadDate=new Date();
    private Long threadLikes;
    private Long threadRetweets;
    @ManyToOne
    @JoinColumn(name = "created_by_id")
    private User createdBy;

}
