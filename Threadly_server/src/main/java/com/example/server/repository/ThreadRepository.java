package com.example.server.repository;

import com.example.server.model.Thread;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface ThreadRepository extends JpaRepository<Thread, Long> {
    List<Thread> findAllByCreatedBy_BannedFalseOrderByThreadDateDesc();
    List<Thread> findByCategoryAndCreatedBy_BannedFalseOrderByThreadDateDesc(String category);
    List<Thread> findByCreatedBy_IdOrderByThreadDateDesc(long userId);
    List<Thread> findByCreatedBy_IdInAndCreatedBy_BannedFalseOrderByThreadDateDesc(Collection<Long> userIds);
    List<Thread> findTop50ByOrderByThreadDateDesc();

    @Query("""
            select t from Thread t
            where t.createdBy.banned = false
              and (lower(t.threadText) like lower(concat('%', :q, '%'))
                or lower(t.title) like lower(concat('%', :q, '%'))
                or lower(t.category) like lower(concat('%', :q, '%'))
                or lower(t.city) like lower(concat('%', :q, '%')))
            order by t.threadDate desc
            """)
    List<Thread> searchListings(@Param("q") String q, Pageable pageable);
}