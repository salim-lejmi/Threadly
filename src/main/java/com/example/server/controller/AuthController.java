package com.example.server.controller;
import com.example.server.dto.LoginRequest;
import com.example.server.dto.SignupRequest;
import com.example.server.model.User;
import com.example.server.service.AuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {

    private final AuthService authService;
    public AuthController (AuthService authService){

        this.authService=authService;
    }

    @PostMapping("/signup")
    public User signUp(@Valid @RequestBody SignupRequest request){

        return authService.signup(request);
    }

    @PostMapping("/login")
    public User login(@Valid @RequestBody LoginRequest loginRequest,HttpSession session){
        User user=authService.login(loginRequest.getUsername(),loginRequest.getPassword());
        session.setAttribute("userId", user.getId());
        return user;
    }


}
