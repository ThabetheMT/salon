package com.uncle.authpractice.controller;

import com.uncle.authpractice.model.Role;
import com.uncle.authpractice.model.User;
import com.uncle.authpractice.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/users/me")
    public ResponseEntity<?> getUser() {
        try{
            String email = SecurityContextHolder.getContext().getAuthentication().getPrincipal().toString();
            return ResponseEntity.ok()
                    .body(userRepository.findByEmail(email)
                            .orElseThrow());
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping("stylists")
    public ResponseEntity<?> getStylists() {
        try {
            return ResponseEntity.ok()
                    .body(userRepository.findAllByRoleOrderByIdDesc(Role.STYLIST));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping("admins")
    public ResponseEntity<?> getAdmins() {
        try {
            return ResponseEntity.ok()
                    .body(userRepository.findAllByRoleOrderByIdDesc(Role.ADMIN));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping("customers")
    public ResponseEntity<?> getCustomers() {
        try {
            return ResponseEntity.ok()
                    .body(userRepository.findAllByRoleOrderByIdDesc(Role.CUSTOMER));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping("managers")
    public ResponseEntity<?> getManagers() {
        try {
            return ResponseEntity.ok()
                    .body(userRepository.findAllByRoleOrderByIdDesc(Role.MANAGER));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }
}
