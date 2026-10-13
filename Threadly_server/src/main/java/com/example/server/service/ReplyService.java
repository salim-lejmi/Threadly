package com.example.server.service;

import com.example.server.model.Reply;
import com.example.server.model.ReplyLike;
import com.example.server.model.Thread;
import com.example.server.model.User;
import com.example.server.repository.ReplyLikeRepository;
import com.example.server.repository.ReplyRepository;
import com.example.server.repository.RetweetRepository;
import com.example.server.repository.ThreadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RequiredArgsConstructor
@Service
public class ReplyService {
    private static final int MAX_LENGTH = 255;

    private final ReplyRepository replyRepository;
    private final ThreadRepository threadRepository;
    private final ReplyLikeRepository replyLikeRepository;
    private final RetweetRepository retweetRepository;
    private final FileStorageService fileStorageService;

    public Reply createReply(String text, MultipartFile image, User currentUser, long threadId){
        Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found"));

        String clean = text == null ? "" : text.trim();
        boolean hasImage = image != null && !image.isEmpty();
        if (clean.isEmpty() && !hasImage){
            throw new RuntimeException("Write something or add an image");
        }
        if (clean.length() > MAX_LENGTH){
            throw new RuntimeException("A reply can't be longer than " + MAX_LENGTH + " characters");
        }

        Reply reply = new Reply();
        reply.setReplyText(clean);
        reply.setImageUrl(fileStorageService.saveImage(image));
        reply.setThread(thread);
        reply.setCreatedBy(currentUser);
        return replyRepository.save(reply);
    }

    public List<Reply> getRepliesByThread(long threadId){
        return replyRepository.findByThread_ThreadIdAndCreatedBy_BannedFalseOrderByReplyDateAsc(threadId);
    }

    @Transactional
    public void deleteReply(long replyId, User currentUser){
        Reply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new RuntimeException("Reply not found"));

        boolean isAdmin = User.ROLE_ADMIN.equals(currentUser.getRole());
        if (!isAdmin && reply.getCreatedBy().getId() != currentUser.getId()){
            throw new RuntimeException("You can't delete someone else's reply");
        }

        String image = reply.getImageUrl();
        replyLikeRepository.deleteByReply_ReplyId(replyId);
        retweetRepository.deleteByReply_ReplyId(replyId);
        replyRepository.delete(reply);
        fileStorageService.delete(image);
    }

    public Reply likeReply(long replyId, User currentUser){
        Reply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new RuntimeException("Reply not found"));
        if (replyLikeRepository.findByUser_IdAndReply_ReplyId(currentUser.getId(), replyId).isPresent()){
            throw new RuntimeException("Already liked");
        }
        ReplyLike like = new ReplyLike();
        like.setUser(currentUser);
        like.setReply(reply);
        replyLikeRepository.save(like);

        long current = reply.getReplyLikes() == null ? 0 : reply.getReplyLikes();
        reply.setReplyLikes(current + 1);
        return replyRepository.save(reply);
    }

    public Reply unlikeReply(long replyId, User currentUser){
        Reply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new RuntimeException("Reply not found"));
        ReplyLike like = replyLikeRepository.findByUser_IdAndReply_ReplyId(currentUser.getId(), replyId)
                .orElseThrow(() -> new RuntimeException("You haven't liked this reply"));
        replyLikeRepository.delete(like);

        long current = reply.getReplyLikes() == null ? 0 : reply.getReplyLikes();
        reply.setReplyLikes(Math.max(0, current - 1));
        return replyRepository.save(reply);
    }

    public List<Long> getLikedReplyIds(long userId){
        return replyLikeRepository.findByUser_Id(userId).stream()
                .map(l -> l.getReply().getReplyId())
                .toList();
    }
}