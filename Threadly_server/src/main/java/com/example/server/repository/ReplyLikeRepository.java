package com.example.server.repository;

import com.example.server.model.ReplyLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReplyLikeRepository extends JpaRepository<ReplyLike, Long> {
    Optional<ReplyLike> findByUser_IdAndReply_ReplyId(long userId, long replyId);
    List<ReplyLike> findByUser_Id(long userId);
    void deleteByReply_ReplyId(long replyId);
}