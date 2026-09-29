package com.example.server.controller;

import com.example.server.model.Follow;
import com.example.server.model.User;
import com.example.server.repository.UserRepository;
import com.example.server.service.FollowService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/users/{userId}")
public class FollowController {

    private final FollowService followService;
    private final UserRepository userRepository;

    private User getCurrentUser(HttpSession session){
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null){
            throw new RuntimeException("Not logged in");
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/follow")
    public Follow followUser(@PathVariable long userId, HttpSession session){
        User currentUser = getCurrentUser(session);
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return followService.followUser(currentUser, targetUser);
    }

    @DeleteMapping("/follow")
    public void unfollowUser(@PathVariable long userId, HttpSession session){
        followService.unfollowUser(getCurrentUser(session), userId);
    }

    @GetMapping("/following")
    public List<Follow> getFollowing(@PathVariable long userId){
        return followService.getFollowing(userId);
    }

    @GetMapping("/followers")
    public List<Follow> getFollowers(@PathVariable long userId){
        return followService.getFollowers(userId);
    }
}