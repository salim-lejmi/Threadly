package com.example.server.controller;

import com.example.server.model.User;
import com.example.server.repository.UserRepository;
import com.example.server.service.FileStorageService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    private User getCurrentUser(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            throw new RuntimeException("Not logged in");
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

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

    @PutMapping("/me")
    public User updateProfile(@RequestBody Map<String, String> body, HttpSession session) {
        User me = getCurrentUser(session);
        String bio = body.getOrDefault("bio", "").trim();
        if (bio.length() > 160) {
            throw new RuntimeException("Bio can't be longer than 160 characters");
        }
        me.setBio(bio);
        return userRepository.save(me);
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public User updateAvatar(@RequestParam("image") MultipartFile image, HttpSession session) {
        User me = getCurrentUser(session);
        if (image.isEmpty()) {
            throw new RuntimeException("Choose an image first");
        }
        String old = me.getProfilePicture();
        me.setProfilePicture(fileStorageService.saveImage(image));
        User saved = userRepository.save(me);
        fileStorageService.delete(old);
        return saved;
    }

    @DeleteMapping("/me/avatar")
    public User removeAvatar(HttpSession session) {
        User me = getCurrentUser(session);
        String old = me.getProfilePicture();
        me.setProfilePicture(null);
        User saved = userRepository.save(me);
        fileStorageService.delete(old);
        return saved;
    }
}