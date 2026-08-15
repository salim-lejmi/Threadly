package com.example.server.model;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Date;
import java.util.List;
@Entity
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotBlank(message = "Username is required")
    @Column(unique = true)
    private String username;

    @Email
    @NotBlank(message = "Email is required")
    @Column(unique = true)
    private String email;

    @NotBlank(message="Password required")
    private String password;

    @NotBlank(message="Phone number required")
    private Number phoneNumber;

    private String profilePicture;

    private String bio;

    private Date birthDate = new Date();

    private Date createdAt = new Date();

    private String role="role-user";

}
