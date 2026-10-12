package com.example.server.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Date;

@Entity
@Table(name = "users")
@Data
public class User {
    public static final String ROLE_USER = "role-user";
    public static final String ROLE_ADMIN = "role-admin";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotBlank(message = "Username is required")
    @Column(unique = true)
    private String username;

    @JsonIgnore
    @Email
    @NotBlank(message = "Email is required")
    @Column(unique = true)
    private String email;

    @JsonIgnore
    @NotBlank(message = "Password required")
    private String password;

    @JsonIgnore
    @NotNull(message = "Phone number required")
    private Long phoneNumber;

    private String profilePicture;

    private String bio;

    @JsonIgnore
    private Date birthDate = new Date();

    private Date createdAt = new Date();

    private String role = ROLE_USER;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean banned = false;
}