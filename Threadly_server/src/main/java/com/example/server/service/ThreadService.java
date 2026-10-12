package com.example.server.service;

import com.example.server.dto.ThreadRequest;
import com.example.server.model.Reply;
import com.example.server.model.Thread;
import com.example.server.model.ThreadLike;
import com.example.server.model.User;
import com.example.server.repository.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Service
public class ThreadService {
    private final ThreadRepository threadRepository;
    private final ThreadLikeRepository threadLikeRepository;
    private final ReplyRepository replyRepository;
    private final ReplyLikeRepository replyLikeRepository;
    private final RetweetRepository retweetRepository;
    private final FollowRepository followRepository;

    public List<Thread> getAllThreads(){
        return threadRepository.findAllByCreatedBy_BannedFalseOrderByThreadDateDesc();
    }

    public List<Thread> getFeed(long userId){
        List<Long> ids = new ArrayList<>(
                followRepository.findByFollower_Id(userId).stream()
                        .map(f -> f.getFollowing().getId())
                        .toList()
        );
        ids.add(userId);
        return threadRepository.findByCreatedBy_IdInAndCreatedBy_BannedFalseOrderByThreadDateDesc(ids);
    }

    public List<Thread> getThreadsByUser(long userId){
        return threadRepository.findByCreatedBy_IdOrderByThreadDateDesc(userId);
    }

    public Thread getThreadById(long threadId){
        return threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found"));
    }

    public Thread createThread(@Valid ThreadRequest request, User currentUser){
        Thread thread = new Thread();
        thread.setThreadText(request.getThreadText());
        thread.setCreatedBy(currentUser);
        return threadRepository.save(thread);
    }

    @Transactional
    public void deleteThread(long threadId, User currentUser){
        Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found"));

        boolean isAdmin = User.ROLE_ADMIN.equals(currentUser.getRole());
        if (!isAdmin && thread.getCreatedBy().getId() != currentUser.getId()){
            throw new RuntimeException("You can't delete someone else's thread");
        }

        for (Reply reply : replyRepository.findByThread_ThreadId(threadId)){
            replyLikeRepository.deleteByReply_ReplyId(reply.getReplyId());
            retweetRepository.deleteByReply_ReplyId(reply.getReplyId());
            replyRepository.delete(reply);
        }
        threadLikeRepository.deleteByThread_ThreadId(threadId);
        retweetRepository.deleteByThread_ThreadId(threadId);
        threadRepository.deleteById(threadId);
    }

    public Thread likeThread(long threadId, User currentUser){
        Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found"));
        if (threadLikeRepository.findByUser_IdAndThread_ThreadId(currentUser.getId(), threadId).isPresent()){
            throw new RuntimeException("Already liked");
        }
        ThreadLike like = new ThreadLike();
        like.setUser(currentUser);
        like.setThread(thread);
        threadLikeRepository.save(like);

        long current = thread.getThreadLikes() == null ? 0 : thread.getThreadLikes();
        thread.setThreadLikes(current + 1);
        return threadRepository.save(thread);
    }

    public Thread unlikeThread(long threadId, User currentUser){
        Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found"));
        ThreadLike like = threadLikeRepository.findByUser_IdAndThread_ThreadId(currentUser.getId(), threadId)
                .orElseThrow(() -> new RuntimeException("You haven't liked this thread"));
        threadLikeRepository.delete(like);

        long current = thread.getThreadLikes() == null ? 0 : thread.getThreadLikes();
        thread.setThreadLikes(Math.max(0, current - 1));
        return threadRepository.save(thread);
    }

    public List<Long> getLikedThreadIds(long userId){
        return threadLikeRepository.findByUser_Id(userId).stream()
                .map(l -> l.getThread().getThreadId())
                .toList();
    }
}