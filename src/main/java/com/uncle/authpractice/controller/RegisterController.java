package com.uncle.authpractice.controller;

import com.uncle.authpractice.dto.RegisterRequest;
import com.uncle.authpractice.dto.RegisterResponse;
import com.uncle.authpractice.service.RegisterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/register")
public class RegisterController {

    private final RegisterService registerService;

    public RegisterController(RegisterService registerService) {
        this.registerService = registerService;
    }

    @PostMapping
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        try{
            return ResponseEntity.ok()
                    .body(registerService.register(registerRequest));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }
}
