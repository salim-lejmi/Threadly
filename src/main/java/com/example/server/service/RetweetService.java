package com.example.server.service;
import com.example.server.model.*;
import com.example.server.model.Thread;
import com.example.server.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@RequiredArgsConstructor
@Service

public class RetweetService {
    private final RetweetRepository retweetRepository;
    private final ThreadRepository threadRepository;
    private final ReplyRepository replyRepository;

    public Retweet retweetThread (long threadId, User currentUser){
        Thread thread=threadRepository.findById(threadId)
                .orElseThrow(()->new RuntimeException("Thread not found"));
        Retweet retweet=new Retweet();
        retweet.setThread(thread);
        retweet.setRetweetedBy(currentUser);
        return retweetRepository.save(retweet);
    }
    public void undoRetweetThread(long threadId,User currentUser){
        Retweet retweet=retweetRepository
                .findByRetweetedBy_IdAndThread_ThreadId(currentUser.getId(),threadId)
                .orElseThrow(()->new RuntimeException("Retweet not found"));
        retweetRepository.delete(retweet);
    }
    public Retweet retweetReply (long replyId, User currentUser){
        Reply reply=replyRepository.findById(replyId)
                .orElseThrow(()->new RuntimeException("Reply not found"));
        Retweet retweet=new Retweet();
        retweet.setReply(reply);
        retweet.setRetweetedBy(currentUser);
        return retweetRepository.save(retweet);
    }
    public void undoRetweetReply(long replyId,User currentUser){
        Retweet retweet=retweetRepository
                .findByRetweetedBy_IdAndReply_ReplyId(currentUser.getId(),replyId)
                .orElseThrow(()->new RuntimeException("Retweet not found"));
        retweetRepository.delete(retweet);
    }
    public List<Retweet> getRetweetByUser(long userId){
        return retweetRepository.findByRetweetedBy_IdOrderByRetweetDateDesc(userId);
    }
}
