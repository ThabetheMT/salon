package com.uncle.authpractice.service;

import com.uncle.authpractice.dto.LoginRequest;
import com.uncle.authpractice.dto.LoginResponse;
import com.uncle.authpractice.model.User;
import com.uncle.authpractice.repository.UserRepository;
import com.uncle.authpractice.util.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class LoginService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final JwtUtil util;

    public LoginService(UserRepository userRepository, BCryptPasswordEncoder bCryptPasswordEncoder, JwtUtil util) {
        this.userRepository = userRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.util = util;
    }

    public LoginResponse login(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!bCryptPasswordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Wrong password");
        }
        String token = util.generateToken(loginRequest.getEmail());
        return new LoginResponse(token, user, "Logged in successfully");
    }
}
