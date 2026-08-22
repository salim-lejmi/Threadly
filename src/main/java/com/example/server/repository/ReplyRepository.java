package com.example.server.repository;

import com.example.server.model.Reply;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReplyRepository extends JpaRepository<Reply, Long> {
    List<Reply> findByThread_ThreadIdOrderByReplyDateAsc(long threadId);

}