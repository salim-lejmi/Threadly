package com.example.server.repository;

import com.example.server.model.Retweet;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RetweetRepository extends JpaRepository<Retweet, Long> {
    List<Retweet> findByRetweetedBy_IdOrderByRetweetDateDesc(long userId); // for profile page
    Optional<Retweet> findByRetweetedBy_IdAndThread_ThreadId(long userId, long threadId);
    Optional<Retweet> findByRetweetedBy_IdAndReply_ReplyId(long userId, long replyId);
}