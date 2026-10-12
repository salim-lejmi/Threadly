package com.example.server.repository;

import com.example.server.model.Thread;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface ThreadRepository extends JpaRepository<Thread, Long> {
    List<Thread> findAllByCreatedBy_BannedFalseOrderByThreadDateDesc();
    List<Thread> findByCreatedBy_IdOrderByThreadDateDesc(long userId);
    List<Thread> findByCreatedBy_IdInAndCreatedBy_BannedFalseOrderByThreadDateDesc(Collection<Long> userIds);
    List<Thread> findTop30ByThreadTextContainingIgnoreCaseAndCreatedBy_BannedFalseOrderByThreadDateDesc(String q);
    List<Thread> findTop50ByOrderByThreadDateDesc();
}