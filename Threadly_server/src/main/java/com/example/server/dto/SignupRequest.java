package com.example.server.dto;
import lombok.Data;
import jakarta.validation.constraints.NotNull;
import java.util.Date;

@Data
public class SignupRequest {
    private String username;
    private String password;
    private Date birthDate;
    private Long phoneNumber;
    private String email;

}
