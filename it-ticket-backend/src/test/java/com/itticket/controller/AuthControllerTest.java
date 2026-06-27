package com.itticket.controller;

import com.itticket.dto.response.AuthResponse;
import com.itticket.security.CustomUserDetailsService;
import com.itticket.security.JwtTokenProvider;
import com.itticket.service.AuthService;
import com.itticket.service.TokenBlacklistService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private TokenBlacklistService tokenBlacklistService;

    @Test
    void refreshAcceptsRefreshTokenFromRequestBody() throws Exception {
        AuthResponse authResponse = AuthResponse.builder().accessToken("new-access-token").build();
        when(authService.refresh("body-token")).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"refreshToken\":\"body-token\"}"))
                .andExpect(status().isOk());

        verify(authService).refresh("body-token");
    }

    @Test
    void refreshAcceptsRefreshTokenFromAuthorizationHeader() throws Exception {
        AuthResponse authResponse = AuthResponse.builder().accessToken("new-access-token").build();
        when(authService.refresh("header-token")).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/refresh")
                .header("Authorization", "Bearer header-token"))
                .andExpect(status().isOk());

        verify(authService).refresh("header-token");
    }
}
