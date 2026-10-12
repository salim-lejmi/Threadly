package com.example.server.controller;

import com.example.server.exception.ForbiddenException;
import com.example.server.model.Reply;
import com.example.server.model.Thread;
import com.example.server.model.User;
import com.example.server.repository.UserRepository;
import com.example.server.service.AdminService;
import com.example.server.service.ReplyService;
import com.example.server.service.ThreadService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;
    private final ThreadService threadService;
    private final ReplyService replyService;
    private final UserRepository userRepository;

    private User requireAdmin(HttpSession session){
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null){
            throw new RuntimeException("Not logged in");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!User.ROLE_ADMIN.equals(user.getRole())){
            throw new ForbiddenException("Admins only");
        }
        return user;
    }

    @GetMapping("/stats")
    public Map<String, Long> stats(HttpSession session){
        requireAdmin(session);
        return adminService.getStats();
    }

    @GetMapping("/users")
    public List<User> users(HttpSession session){
        requireAdmin(session);
        return adminService.getUsers();
    }

    @PostMapping("/users/{userId}/ban")
    public User ban(@PathVariable long userId, HttpSession session){
        requireAdmin(session);
        return adminService.setBanned(userId, true);
    }

    @PostMapping("/users/{userId}/unban")
    public User unban(@PathVariable long userId, HttpSession session){
        requireAdmin(session);
        return adminService.setBanned(userId, false);
    }

    @GetMapping("/threads")
    public List<Thread> threads(HttpSession session){
        requireAdmin(session);
        return adminService.getRecentThreads();
    }

    @DeleteMapping("/threads/{threadId}")
    public void deleteThread(@PathVariable long threadId, HttpSession session){
        threadService.deleteThread(threadId, requireAdmin(session));
    }

    @GetMapping("/replies")
    public List<Reply> replies(HttpSession session){
        requireAdmin(session);
        return adminService.getRecentReplies();
    }

    @DeleteMapping("/replies/{replyId}")
    public void deleteReply(@PathVariable long replyId, HttpSession session){
        replyService.deleteReply(replyId, requireAdmin(session));
    }
}