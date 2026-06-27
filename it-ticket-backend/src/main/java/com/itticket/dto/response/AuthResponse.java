package com.itticket.dto.response;

import com.itticket.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private Long userId;
    private String name;
    private String email;
    private Role role;
    private String refreshTokenString;
}
