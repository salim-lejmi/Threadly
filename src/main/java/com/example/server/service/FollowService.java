package com.example.server.service;

import com.example.server.model.Follow;
import com.example.server.model.User;
import com.example.server.repository.FollowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@RequiredArgsConstructor
@Service
public class FollowService {

    private final FollowRepository followRepository;

    public Follow followUser(User currentUser, User targetUser){
        if (currentUser.getId() == targetUser.getId()){
            throw new RuntimeException("You can't follow yourself");
        }
        if (followRepository.findByFollower_IdAndFollowing_Id(currentUser.getId(), targetUser.getId()).isPresent()){
            throw new RuntimeException("Already following this user");
        }
        Follow follow = new Follow();
        follow.setFollower(currentUser);
        follow.setFollowing(targetUser);
        return followRepository.save(follow);
    }

    public void unfollowUser(User currentUser, long targetUserId){
        Follow follow = followRepository.findByFollower_IdAndFollowing_Id(currentUser.getId(), targetUserId)
                .orElseThrow(() -> new RuntimeException("You're not following this user"));
        followRepository.delete(follow);
    }

    public List<Follow> getFollowing(long userId){
        return followRepository.findByFollower_Id(userId);
    }

    public List<Follow> getFollowers(long userId){
        return followRepository.findByFollowing_Id(userId);
    }
}