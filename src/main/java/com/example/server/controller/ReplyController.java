package com.example.server.controller;

import com.example.server.dto.ReplyRequest;
import com.example.server.model.Reply;
import com.example.server.model.User;
import com.example.server.repository.UserRepository;
import com.example.server.service.ReplyService;
import com.example.server.service.ThreadService;
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
    private final ThreadService threadService;

    @PostMapping
    public Reply createReply(@Valid @RequestBody ReplyRequest request,HttpSession session,@PathVariable long threadId){
        Long userId=(Long) session.getAttribute("userId");
        if(userId==null){
            throw new RuntimeException("Not logged in");
        }
        User currentUser=userRepository.findById(userId)
                .orElseThrow(()->new RuntimeException("User not found"));
        return replyService.createReply(request, currentUser, threadId);    }
    @DeleteMapping("/{replyId}")
    public void deleteReply(@PathVariable long replyId){
        replyService.deleteReply(replyId);
    }
}
