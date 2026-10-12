package com.example.server.service;

import com.example.server.exception.ForbiddenException;
import com.example.server.model.Reply;
import com.example.server.model.Thread;
import com.example.server.model.User;
import com.example.server.repository.ReplyRepository;
import com.example.server.repository.ThreadRepository;
import com.example.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ThreadRepository threadRepository;
    private final ReplyRepository replyRepository;

    public Map<String, Long> getStats(){
        Map<String, Long> stats = new LinkedHashMap<>();
        stats.put("users", userRepository.count());
        stats.put("banned", userRepository.countByBannedTrue());
        stats.put("threads", threadRepository.count());
        stats.put("replies", replyRepository.count());
        return stats;
    }

    public List<User> getUsers(){
        return userRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Thread> getRecentThreads(){
        return threadRepository.findTop50ByOrderByThreadDateDesc();
    }

    public List<Reply> getRecentReplies(){
        return replyRepository.findTop50ByOrderByReplyDateDesc();
    }

    public User setBanned(long targetId, boolean banned){
        User target = userRepository.findById(targetId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (User.ROLE_ADMIN.equals(target.getRole())){
            throw new ForbiddenException("You can't ban an admin");
        }
        target.setBanned(banned);
        return userRepository.save(target);
    }}