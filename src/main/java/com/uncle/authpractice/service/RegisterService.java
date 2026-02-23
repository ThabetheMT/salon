package com.uncle.authpractice.service;

import com.uncle.authpractice.dto.RegisterRequest;
import com.uncle.authpractice.dto.RegisterResponse;
import com.uncle.authpractice.model.Role;
import com.uncle.authpractice.model.User;
import com.uncle.authpractice.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class RegisterService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    public RegisterService(UserRepository userRepository, BCryptPasswordEncoder bCryptPasswordEncoder) {
        this.userRepository = userRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }

    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return new RegisterResponse(false, "Email already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(bCryptPasswordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRole(Role.CUSTOMER);
        user.setPhone(request.getPhone());
        User saved = userRepository.save(user);

        return new RegisterResponse(saved, "User registered successfully");
    }
}
