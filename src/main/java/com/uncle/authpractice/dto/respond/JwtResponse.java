package com.uncle.authpractice.dto.respond;

import com.uncle.authpractice.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
@Builder
public class JwtResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private Long id;
    private String name;
    private String email;
    private Role role;
    private List<String> permissions;

    public JwtResponse(String accessToken, String refreshToken, Long id, String name, String email, Role role) {
        this.accessToken = accessToken;
        this.email = email;
        this.refreshToken = refreshToken;
        this.id = id;
        this.name = name;
        this.role = role;
    }
}
