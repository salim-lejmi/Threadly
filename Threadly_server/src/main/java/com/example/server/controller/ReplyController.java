package com.example.server.controller;

import com.example.server.dto.ReplyRequest;
import com.example.server.model.Reply;
import com.example.server.model.User;
import com.example.server.repository.UserRepository;
import com.example.server.service.ReplyService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/threads/{threadId}/replies")
public class ReplyController {

    private final ReplyService replyService;
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
    public List<Reply> getReplies(@PathVariable long threadId){
        return replyService.getRepliesByThread(threadId);
    }

    @GetMapping("/liked")
    public List<Long> getLikedReplyIds(HttpSession session){
        return replyService.getLikedReplyIds(getCurrentUser(session).getId());
    }

    @PostMapping
    public Reply createReply(@Valid @RequestBody ReplyRequest request, HttpSession session, @PathVariable long threadId){
        return replyService.createReply(request, getCurrentUser(session), threadId);
    }

    @DeleteMapping("/{replyId}")
    public void deleteReply(@PathVariable long replyId, HttpSession session){
        replyService.deleteReply(replyId, getCurrentUser(session));
    }

    @PostMapping("/{replyId}/like")
    public Reply likeReply(@PathVariable long replyId, HttpSession session){
        return replyService.likeReply(replyId, getCurrentUser(session));
    }

    @DeleteMapping("/{replyId}/like")
    public Reply unlikeReply(@PathVariable long replyId, HttpSession session){
        return replyService.unlikeReply(replyId, getCurrentUser(session));
    }
}