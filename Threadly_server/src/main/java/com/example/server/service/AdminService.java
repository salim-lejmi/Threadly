package com.example.server.service;

import com.example.server.dto.FlaggedListing;
import com.example.server.exception.ForbiddenException;
import com.example.server.model.Reply;
import com.example.server.model.Thread;
import com.example.server.model.User;
import com.example.server.repository.ReplyRepository;
import com.example.server.repository.ThreadRepository;
import com.example.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${app.ml.risk-threshold:0.7}")
    private double riskThreshold;

    public Map<String, Long> getStats(){
        Map<String, Long> stats = new LinkedHashMap<>();
        stats.put("users", userRepository.count());
        stats.put("banned", userRepository.countByBannedTrue());
        stats.put("threads", threadRepository.count());
        stats.put("replies", replyRepository.count());
        stats.put("flagged", threadRepository.countByRiskScoreGreaterThanEqualAndRiskDismissedFalse(riskThreshold));
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

    public List<FlaggedListing> getFlagged(){
        return threadRepository
                .findTop50ByRiskScoreGreaterThanEqualAndRiskDismissedFalseOrderByRiskScoreDesc(riskThreshold)
                .stream()
                .map(t -> new FlaggedListing(t, t.getRiskScore()))
                .toList();
    }

    public void dismissFlag(long threadId){
        Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        thread.setRiskDismissed(true);
        threadRepository.save(thread);
    }

    public User setBanned(long targetId, boolean banned){
        User target = userRepository.findById(targetId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (User.ROLE_ADMIN.equals(target.getRole())){
            throw new ForbiddenException("You can't ban an admin");
        }
        target.setBanned(banned);
        return userRepository.save(target);
    }
}