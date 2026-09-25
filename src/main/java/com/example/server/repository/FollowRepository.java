package com.example.server.repository;

import com.example.server.model.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow, Long> {
    Optional<Follow> findByFollower_IdAndFollowing_Id(long followerId, long followingId);
    List<Follow> findByFollower_Id(long followerId);   // who this user follows
    List<Follow> findByFollowing_Id(long followingId); // who follows this user
}