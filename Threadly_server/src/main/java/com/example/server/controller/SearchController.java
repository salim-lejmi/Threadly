package com.example.server.controller;

import com.example.server.model.Thread;
import com.example.server.model.User;
import com.example.server.repository.ThreadRepository;
import com.example.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/search")
public class SearchController {

    private final UserRepository userRepository;
    private final ThreadRepository threadRepository;

    @GetMapping("/users")
    public List<User> searchUsers(@RequestParam String q){
        return userRepository.findTop20ByUsernameContainingIgnoreCaseAndBannedFalse(q);
    }

    @GetMapping("/threads")
    public List<Thread> searchThreads(@RequestParam String q){
        return threadRepository
                .findTop30ByThreadTextContainingIgnoreCaseAndCreatedBy_BannedFalseOrderByThreadDateDesc(q);
    }
}