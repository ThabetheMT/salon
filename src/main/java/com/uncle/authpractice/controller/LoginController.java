package com.uncle.authpractice.controller;

import com.uncle.authpractice.dto.LoginRequest;
import com.uncle.authpractice.service.LoginService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/login")
public class LoginController {

    private final LoginService loginService;

    public LoginController(LoginService loginService) {
        this.loginService = loginService;
    }

    @PostMapping
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            return ResponseEntity.ok()
                    .body(loginService.login(loginRequest));
        } catch (Exception e) {
            return ResponseEntity.ok()
                    .body(e.getMessage());
        }
    }
}
