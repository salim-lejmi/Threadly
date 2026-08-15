package com.example.server.dto;
import jakarta.validation.constraints.Email;
import lombok.Data;

import java.util.Date;

@Data
public class SignupRequest {
    private String username;
    private String password;
    private Date birthDate;
    private Number phoneNumber;
    private String email;

}
