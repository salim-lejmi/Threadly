package com.example.server.controller;

import com.example.server.dto.ThreadRequest;
import com.example.server.model.Thread;
import com.example.server.model.User;
import com.example.server.repository.UserRepository;
import com.example.server.service.ThreadService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/threads")
public class ThreadController {

    private final ThreadService threadService;
    private final UserRepository userRepository;

    private User getCurrentUser(HttpSession session){
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null){
            throw new RuntimeException("Not logged in");
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public List<Thread> getAllThreads(){
        return threadService.getAllThreads();
    }

    @GetMapping("/feed")
    public List<Thread> getFeed(HttpSession session){
        return threadService.getFeed(getCurrentUser(session).getId());
    }

    @GetMapping("/liked")
    public List<Long> getLikedThreadIds(HttpSession session){
        return threadService.getLikedThreadIds(getCurrentUser(session).getId());
    }

    @GetMapping("/user/{userId}")
    public List<Thread> getThreadsByUser(@PathVariable long userId){
        return threadService.getThreadsByUser(userId);
    }

    @GetMapping("/{threadId}")
    public Thread getThreadById(@PathVariable long threadId){
        return threadService.getThreadById(threadId);
    }

    @PostMapping
    public Thread createThread(@Valid @RequestBody ThreadRequest request, HttpSession session){
        return threadService.createThread(request, getCurrentUser(session));
    }

    @DeleteMapping("/{threadId}")
    public void deleteThread(@PathVariable long threadId, HttpSession session){
        threadService.deleteThread(threadId, getCurrentUser(session).getId());
    }

    @PostMapping("/{threadId}/like")
    public Thread likeThread(@PathVariable long threadId, HttpSession session){
        return threadService.likeThread(threadId, getCurrentUser(session));
    }

    @DeleteMapping("/{threadId}/like")
    public Thread unlikeThread(@PathVariable long threadId, HttpSession session){
        return threadService.unlikeThread(threadId, getCurrentUser(session));
    }
}