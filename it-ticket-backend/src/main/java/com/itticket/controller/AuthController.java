package com.itticket.controller;

import com.itticket.dto.request.*;
import com.itticket.dto.response.ApiResponse;
import com.itticket.dto.response.AuthResponse;
import com.itticket.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> registerUser(@Valid @RequestBody RegisterRequest request) {
        authService.registerUser(request);
        return ResponseEntity
                .ok(ApiResponse.success("Registration successful. Please verify your email with the OTP sent."));
    }

    @PostMapping("/register/agent")
    public ResponseEntity<ApiResponse<Void>> registerAgent(@Valid @RequestBody RegisterRequest request) {
        authService.registerAgent(request);
        return ResponseEntity.ok(ApiResponse.success("Agent registration submitted. Awaiting admin approval."));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request);
        setRefreshTokenCookie(response, authResponse.getRefreshTokenString());
        return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        authService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully. You can now login."));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<Void>> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        authService.resendOtp(request);
        return ResponseEntity.ok(ApiResponse.success("OTP resent successfully."));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            HttpServletRequest request,
            HttpServletResponse response) {
        String refreshToken = getRefreshTokenFromCookie(request);
        AuthResponse authResponse = authService.refresh(refreshToken);
        setRefreshTokenCookie(response, authResponse.getRefreshTokenString());
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", authResponse));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            HttpServletRequest request,
            HttpServletResponse response) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            authService.logout(authHeader.substring(7));
        }
        clearRefreshTokenCookie(response);
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully."));
    }

    private void setRefreshTokenCookie(
            HttpServletResponse response,
            String token) {
        Cookie cookie = new Cookie(
                "refreshToken",
                token);

        cookie.setHttpOnly(true);

        cookie.setSecure(true);

        cookie.setPath("/");

        cookie.setMaxAge(
                7 * 24 * 60 * 60);

        cookie.setAttribute(
                "SameSite",
                "None");

        response.addCookie(cookie);
    }

    private void clearRefreshTokenCookie(
            HttpServletResponse response) {
        Cookie cookie = new Cookie(
                "refreshToken",
                null);

        cookie.setHttpOnly(true);

        cookie.setSecure(true);

        cookie.setPath("/");

        cookie.setAttribute(
                "SameSite",
                "None");

        cookie.setMaxAge(0);

        response.addCookie(cookie);
    }

    private String getRefreshTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("refreshToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        throw new com.itticket.exception.UnauthorizedException("Refresh token cookie missing");
    }
}
