package com.example.server.controller;

import com.example.server.dto.ThreadRequest;
import com.example.server.model.Thread;
import com.example.server.model.User;
import com.example.server.repository.ThreadRepository;
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
    private final ThreadRepository threadRepository;

    @GetMapping
    public List<Thread> getAllThreads(){
        return threadService.getAllThreads();
    }

    @GetMapping("/user/{userId}")
    public List<Thread> getThreadsByUser(@PathVariable long userId){
        return threadService.getThreadsByUser(userId);
    }

    @GetMapping("/{threadId}")
    public Thread getThreadById(@PathVariable long threadId){
        return threadService.getThreadById(threadId);
    }    @PostMapping
    public Thread createThread(@Valid @RequestBody ThreadRequest request, HttpSession session){
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null){
            throw new RuntimeException("Not logged in");
        }
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return threadService.createThread(request, currentUser);
    }

    @DeleteMapping("/{threadId}")
    public void deleteThread(@PathVariable long threadId, HttpSession session){
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null){
            throw new RuntimeException("Not logged in");
        }
        threadService.deleteThread(threadId, userId);
    }
    @PostMapping("/{threadId}/like")
    public Thread likeThread(@PathVariable long threadId){
        return threadService.likeThread(threadId);
    }
    @DeleteMapping ("/{threadId}/like")
    public Thread unlikeThread(@PathVariable long threadId){
        return threadService.unlikeThread(threadId);
    }
}