package com.example.server.service;
import com.example.server.model.User;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;
import com.example.server.dto.ThreadRequest;
import com.example.server.model.Thread;
import com.example.server.repository.ThreadRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;


@RequiredArgsConstructor
@Service

public class ThreadService {
    private final ThreadRepository threadRepository;
    public List<Thread> getAllThreads(){
        return threadRepository.findAllByOrderByThreadDateDesc();
    }
    public List<Thread> getThreadsByUser(long userId){
        return threadRepository.findByCreatedBy_IdOrderByThreadDateDesc(userId);
    }
    public Thread getThreadById(long threadId){
        return threadRepository.findById(threadId)
                .orElseThrow(()->new RuntimeException("Thread not found"));
    }
        public Thread createThread(@Valid ThreadRequest request, User currentUser){
        Thread thread= new Thread();
        thread.setThreadText(request.getThreadText());
        thread.setCreatedBy(currentUser);

        return threadRepository.save(thread);
    }
    public void deleteThread(long threadId){
        if(!threadRepository.existsById(threadId)){
            throw new RuntimeException("Thread not found");
        }
        threadRepository.deleteById(threadId);
    }
}
