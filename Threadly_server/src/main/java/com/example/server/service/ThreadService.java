package com.example.server.service;

import com.example.server.model.Reply;
import com.example.server.model.Thread;
import com.example.server.model.ThreadLike;
import com.example.server.model.User;
import com.example.server.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@RequiredArgsConstructor
@Service
public class ThreadService {
    private static final int MAX_LENGTH = 255;
    private static final int MAX_TITLE = 80;
    private static final int MAX_CITY = 60;
    private static final Set<String> CATEGORIES = Set.of(
            "Home repair", "Design", "Tutoring", "Photography",
            "Food and baking", "Tech help", "Beauty", "Other"
    );

    private final ThreadRepository threadRepository;
    private final ThreadLikeRepository threadLikeRepository;
    private final ReplyRepository replyRepository;
    private final ReplyLikeRepository replyLikeRepository;
    private final RetweetRepository retweetRepository;
    private final FollowRepository followRepository;
    private final FileStorageService fileStorageService;

    public List<Thread> getAllThreads(String category){
        if (category == null || category.isBlank()){
            return threadRepository.findAllByCreatedBy_BannedFalseOrderByThreadDateDesc();
        }
        return threadRepository.findByCategoryAndCreatedBy_BannedFalseOrderByThreadDateDesc(category);
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
        Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        if (thread.getCreatedBy().isBanned()){
            throw new RuntimeException("Listing not found");
        }
        return thread;
    }

    public Thread createThread(String title, String category, Long price, String city,
                               String text, MultipartFile image, User currentUser){
        String cleanTitle = title == null ? "" : title.trim();
        String cleanText = text == null ? "" : text.trim();
        String cleanCity = city == null ? "" : city.trim();

        if (cleanTitle.isEmpty()){
            throw new RuntimeException("Give your listing a title");
        }
        if (cleanTitle.length() > MAX_TITLE){
            throw new RuntimeException("Title can't be longer than " + MAX_TITLE + " characters");
        }
        if (category == null || !CATEGORIES.contains(category)){
            throw new RuntimeException("Choose a category");
        }
        if (price != null && (price < 0 || price > 10_000_000L)){
            throw new RuntimeException("Price must be between 0 and 10,000,000");
        }
        if (cleanCity.length() > MAX_CITY){
            throw new RuntimeException("City can't be longer than " + MAX_CITY + " characters");
        }
        if (cleanText.length() > MAX_LENGTH){
            throw new RuntimeException("Description can't be longer than " + MAX_LENGTH + " characters");
        }

        Thread thread = new Thread();
        thread.setTitle(cleanTitle);
        thread.setCategory(category);
        thread.setPrice(price);
        thread.setCity(cleanCity.isEmpty() ? null : cleanCity);
        thread.setThreadText(cleanText);
        thread.setImageUrl(fileStorageService.saveImage(image));
        thread.setCreatedBy(currentUser);
        return threadRepository.save(thread);
    }

    @Transactional
    public void deleteThread(long threadId, User currentUser){
        Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Listing not found"));

        boolean isAdmin = User.ROLE_ADMIN.equals(currentUser.getRole());
        if (!isAdmin && thread.getCreatedBy().getId() != currentUser.getId()){
            throw new RuntimeException("You can't delete someone else's listing");
        }

        List<String> images = new ArrayList<>();
        for (Reply reply : replyRepository.findByThread_ThreadId(threadId)){
            replyLikeRepository.deleteByReply_ReplyId(reply.getReplyId());
            retweetRepository.deleteByReply_ReplyId(reply.getReplyId());
            images.add(reply.getImageUrl());
            replyRepository.delete(reply);
        }
        images.add(thread.getImageUrl());

        threadLikeRepository.deleteByThread_ThreadId(threadId);
        retweetRepository.deleteByThread_ThreadId(threadId);
        threadRepository.deleteById(threadId);

        images.forEach(fileStorageService::delete);
    }

    public Thread likeThread(long threadId, User currentUser){
        Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        if (threadLikeRepository.findByUser_IdAndThread_ThreadId(currentUser.getId(), threadId).isPresent()){
            throw new RuntimeException("Already saved");
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
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        ThreadLike like = threadLikeRepository.findByUser_IdAndThread_ThreadId(currentUser.getId(), threadId)
                .orElseThrow(() -> new RuntimeException("You haven't saved this listing"));
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