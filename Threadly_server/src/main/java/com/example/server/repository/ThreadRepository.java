package com.example.server.repository;

import com.example.server.model.Thread;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ThreadRepository extends JpaRepository<Thread, Long> {
    List<Thread> findAllByOrderByThreadDateDesc();
    List<Thread> findByCreatedBy_IdOrderByThreadDateDesc(long userId);

}