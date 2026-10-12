package com.example.server.repository;

import com.example.server.model.ThreadLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ThreadLikeRepository extends JpaRepository<ThreadLike, Long> {
    Optional<ThreadLike> findByUser_IdAndThread_ThreadId(long userId, long threadId);
    List<ThreadLike> findByUser_Id(long userId);
    void deleteByThread_ThreadId(long threadId);
}