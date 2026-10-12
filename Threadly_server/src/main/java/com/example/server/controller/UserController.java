package com.example.server.controller;

import com.example.server.model.User;
import com.example.server.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/{userId}")
    public User getUserById(@PathVariable long userId, HttpSession session) {
        User target = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (target.isBanned()) {
            Long viewerId = (Long) session.getAttribute("userId");
            User viewer = viewerId == null ? null : userRepository.findById(viewerId).orElse(null);
            boolean viewerIsAdmin = viewer != null && User.ROLE_ADMIN.equals(viewer.getRole());
            if (!viewerIsAdmin) {
                throw new RuntimeException("User not found");
            }
        }
        return target;
    }
}