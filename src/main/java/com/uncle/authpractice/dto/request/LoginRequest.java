package com.uncle.authpractice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Email or phone is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    private boolean rememberMe;

}
