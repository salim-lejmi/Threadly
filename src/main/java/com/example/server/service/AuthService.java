package com.example.server.service;

import com.example.server.dto.SignupRequest;
import com.example.server.model.User;
import com.example.server.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,PasswordEncoder passwordEncoder){
        this.userRepository=userRepository;
        this.passwordEncoder=passwordEncoder;
    }
    public User signup(@Valid SignupRequest request){
        if (userRepository.existsByEmail(request.getEmail())){
            throw new RuntimeException("Email already exists");
        }
        if (userRepository.existsByUsername(request.getUsername())){
            throw new RuntimeException("Username already exists");
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setBirthDate(request.getBirthDate());
        user.setPhoneNumber(request.getPhoneNumber());
        return userRepository.save(user);
    }

    public User login(String username,String password){
        User user=userRepository.findByUsername(username).orElse(null);
        if (user==null || !passwordEncoder.matches(password,user.getPassword())){
            throw new RuntimeException("email or password doesn't match");

        }
        return user;
    }
}
