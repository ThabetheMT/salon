package com.uncle.authpractice.util;

import com.uncle.authpractice.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter1 extends OncePerRequestFilter {

    private final Logger LOGGER = LoggerFactory.getLogger(JwtAuthenticationFilter1.class);

    private final JwtUtil util;
    private final CustomUserDetailsService customUserDetailsService;

    public JwtAuthenticationFilter1(JwtUtil util, CustomUserDetailsService customUserDetailsService) {
        this.util = util;
        this.customUserDetailsService = customUserDetailsService;

    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String token = extractToken(request);
            if (token != null && util.validateToken(token)) {
                LOGGER.warn("JWT Token validated "+ token);
                String username = util.getEmailFromToken(token);
                LOGGER.info("JWT Token received from user: " + username);
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                auth.setDetails(userDetails);
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        } catch (Exception e){
            throw new ServletException(e);
        }
        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            LOGGER.info("Bearer token found");
            return header.substring(7);
        }else {
            LOGGER.error("Invalid JWT token");
            return null;
        }
    }
}
