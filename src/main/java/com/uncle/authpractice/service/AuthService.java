package com.uncle.authpractice.service;

import com.uncle.authpractice.config.JwtService;
import com.uncle.authpractice.dto.request.LoginRequest;
import com.uncle.authpractice.dto.request.SignupRequest;
import com.uncle.authpractice.dto.respond.JwtResponse;
import com.uncle.authpractice.exceptions.UnauthorizedException;
import com.uncle.authpractice.model.Customer;
import com.uncle.authpractice.model.Role;
import com.uncle.authpractice.model.User;
import com.uncle.authpractice.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    //private final EmailService emailService;

    @Transactional
    public JwtResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return new JwtResponse(accessToken, refreshToken, user.getId(), user.getName(),
                user.getEmail(), user.getRole());
    }

    @Transactional
    public void signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new IllegalArgumentException("Phone number already in use");
        }

        Customer customer = new Customer();
        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setPassword(passwordEncoder.encode(request.getPassword()));
        customer.setRole(Role.CUSTOMER);
        customer.setActive(true);
        customer.setEmailVerified(false);
        customer.setLoyaltyPoints(0);
        customer.setMembershipLevel("Bronze");

        userRepository.save(customer);

        // Send verification email
       // emailService.sendVerificationEmail(customer.getEmail());
    }

    @Transactional
    public JwtResponse refreshToken(String refreshToken) {
        String username = jwtService.extractUsername(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        if (!jwtService.validateToken(refreshToken, userDetails)) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        String newAccessToken = jwtService.generateToken(userDetails);
        return new JwtResponse(newAccessToken, refreshToken, user.getId(), user.getName(),
                user.getEmail(), user.getRole());
    }

    @Transactional
    public void sendPasswordResetEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
        // Generate reset token, store in database, send email
       // emailService.sendPasswordResetEmail(email);
    }

    @Transactional
    public void logout(String token) {
        // In a real app, you could blacklist the token
        // For simplicity, we do nothing here
    }

}
