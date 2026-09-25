package com.example.server.controller;

import com.example.server.model.Retweet;
import com.example.server.model.User;
import com.example.server.repository.UserRepository;
import com.example.server.service.RetweetService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RequiredArgsConstructor
@RestController
public class RetweetController {

    private final RetweetService retweetService;
    private final UserRepository userRepository;

    private User getCurrentUser(HttpSession session){
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null){
            throw new RuntimeException("Not logged in");
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/threads/{threadId}/retweet")
    public Retweet retweetThread(@PathVariable long threadId, HttpSession session){
        return retweetService.retweetThread(threadId, getCurrentUser(session));
    }

    @DeleteMapping("/threads/{threadId}/retweet")
    public void undoRetweetThread(@PathVariable long threadId, HttpSession session){
        retweetService.undoRetweetThread(threadId, getCurrentUser(session));
    }

    @PostMapping("/replies/{replyId}/retweet")
    public Retweet retweetReply(@PathVariable long replyId, HttpSession session){
        return retweetService.retweetReply(replyId, getCurrentUser(session));
    }

    @DeleteMapping("/replies/{replyId}/retweet")
    public void undoRetweetReply(@PathVariable long replyId, HttpSession session){
        retweetService.undoRetweetReply(replyId, getCurrentUser(session));
    }

    @GetMapping("/users/{userId}/retweets")
    public List<Retweet> getRetweetsByUser(@PathVariable long userId){
        return retweetService.getRetweetsByUser(userId);
    }
}