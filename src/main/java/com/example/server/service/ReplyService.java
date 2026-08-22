package com.example.server.service;
import com.example.server.model.User;
import com.example.server.model.Reply;
import com.example.server.model.Thread;
import com.example.server.repository.ThreadRepository;
import jakarta.validation.Valid;
import com.example.server.dto.ReplyRequest;
import com.example.server.repository.ReplyRepository;
import lombok.RequiredArgsConstructor;
import java.util.List;
import org.springframework.stereotype.Service;
@RequiredArgsConstructor
@Service
public class ReplyService {
    private final ReplyRepository replyRepository;
    private final ThreadRepository threadRepository;
    public Reply createReply(@Valid ReplyRequest request, User currentUser,long threadId){
        Thread thread= threadRepository.findById(threadId)
                .orElseThrow(()->new RuntimeException("Thread not found"));
        Reply reply=new Reply();
        reply.setReplyText(request.getReplyText());
        reply.setThread(thread);
        reply.setCreatedBy(currentUser);
        return replyRepository.save(reply);

    }
    public List<Reply> getRepliesByThread(long threadId){
        return replyRepository.findByThread_ThreadIdOrderByReplyDateAsc(threadId);
    }
    public void deleteReply(long replyId){
        if (!replyRepository.existsById(replyId)){
            throw new RuntimeException("Thread not found");
        }
        replyRepository.deleteById(replyId);

    }

}
