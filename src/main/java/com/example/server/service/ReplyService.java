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
    public void deleteReply(long replyId, long currentUserId){
        Reply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new RuntimeException("Reply not found"));
        if (reply.getCreatedBy().getId() != currentUserId){
            throw new RuntimeException("You can't delete someone else's reply");
        }
        replyRepository.deleteById(replyId);
    }
    public Reply likeReply(long replyId){
        Reply reply=replyRepository.findById(replyId)
                .orElseThrow(()->new RuntimeException("Reply not found"));
        long current= reply.getReplyLikes() == null ? 0 : reply.getReplyLikes().longValue();
        reply.setReplyLikes(current+1);
        return replyRepository.save(reply);

    }
    public Reply unlikeReply(long replyId){
        Reply reply=replyRepository.findById(replyId)
                .orElseThrow(()->new RuntimeException("Reply not found"));
        long current= reply.getReplyLikes() == null ? 0 : reply.getReplyLikes().longValue();
        reply.setReplyLikes(Math.max(0,current-1));
        return replyRepository.save(reply);

    }


}
