package com.itticket.controller;

import com.itticket.dto.request.*;
import com.itticket.dto.response.ApiResponse;
import com.itticket.dto.response.AuthResponse;
import com.itticket.exception.UnauthorizedException;
import com.itticket.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

        private final AuthService authService;

        @PostMapping("/register")
        public ResponseEntity<ApiResponse<Void>> registerUser(
                        @Valid @RequestBody RegisterRequest request) {
                authService.registerUser(request);

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Registration successful. Please verify your email with the OTP sent."));
        }

        @PostMapping("/register/agent")
        public ResponseEntity<ApiResponse<Void>> registerAgent(
                        @Valid @RequestBody RegisterRequest request) {
                authService.registerAgent(request);

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Agent registration submitted. Awaiting admin approval."));
        }

        @PostMapping("/login")
        public ResponseEntity<ApiResponse<AuthResponse>> login(
                        @Valid @RequestBody LoginRequest request,
                        HttpServletResponse response) {

                AuthResponse authResponse = authService.login(request);

                setRefreshTokenCookie(
                                response,
                                authResponse.getRefreshTokenString());

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Login successful",
                                                authResponse));
        }

        @PostMapping("/verify-otp")
        public ResponseEntity<ApiResponse<Void>> verifyOtp(
                        @Valid @RequestBody OtpVerifyRequest request) {

                authService.verifyOtp(request);

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Email verified successfully. You can now login."));
        }

        @PostMapping("/resend-otp")
        public ResponseEntity<ApiResponse<Void>> resendOtp(
                        @Valid @RequestBody ResendOtpRequest request) {

                authService.resendOtp(request);

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "OTP resent successfully."));
        }

        @PostMapping("/refresh")
        public ResponseEntity<ApiResponse<AuthResponse>> refresh(
                        @RequestBody(required = false) RefreshTokenRequest requestBody,
                        @RequestHeader(value = "Authorization", required = false) String authHeader,
                        HttpServletRequest request,
                        HttpServletResponse response) {

                String refreshToken = resolveRefreshToken(requestBody, authHeader, request);

                AuthResponse authResponse = authService.refresh(refreshToken);

                setRefreshTokenCookie(
                                response,
                                authResponse.getRefreshTokenString());

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Token refreshed",
                                                authResponse));
        }

        @PostMapping("/logout")
        public ResponseEntity<ApiResponse<Void>> logout(
                        HttpServletRequest request,
                        HttpServletResponse response) {

                String authHeader = request.getHeader("Authorization");

                if (authHeader != null &&
                                authHeader.startsWith("Bearer ")) {

                        authService.logout(
                                        authHeader.substring(7));
                }

                clearRefreshTokenCookie(response);

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Logged out successfully."));
        }

        private void setRefreshTokenCookie(
                        HttpServletResponse response,
                        String token) {

                ResponseCookie cookie = ResponseCookie.from(
                                "refreshToken",
                                token)
                                .httpOnly(true)
                                .secure(true)
                                .sameSite("None")
                                .path("/")
                                .maxAge(7 * 24 * 60 * 60)
                                .build();

                response.addHeader(
                                HttpHeaders.SET_COOKIE,
                                cookie.toString());
        }

        private void clearRefreshTokenCookie(
                        HttpServletResponse response) {

                ResponseCookie cookie = ResponseCookie.from(
                                "refreshToken",
                                "")
                                .httpOnly(true)
                                .secure(true)
                                .sameSite("None")
                                .path("/")
                                .maxAge(0)
                                .build();

                response.addHeader(
                                HttpHeaders.SET_COOKIE,
                                cookie.toString());
        }

        private String resolveRefreshToken(
                        RefreshTokenRequest requestBody,
                        String authHeader,
                        HttpServletRequest request) {

                if (requestBody != null
                                && requestBody.getRefreshToken() != null
                                && !requestBody.getRefreshToken().isBlank()) {
                        return requestBody.getRefreshToken().trim();
                }

                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        return authHeader.substring(7).trim();
                }

                String tokenFromCookie = getRefreshTokenFromCookie(request);

                if (tokenFromCookie != null && !tokenFromCookie.isBlank()) {
                        return tokenFromCookie.trim();
                }

                throw new UnauthorizedException(
                                "Refresh token missing");
        }

        private String getRefreshTokenFromCookie(
                        HttpServletRequest request) {

                Cookie[] cookies = request.getCookies();

                if (cookies != null) {

                        for (Cookie cookie : cookies) {

                                if ("refreshToken"
                                                .equals(
                                                                cookie.getName())) {

                                        return cookie.getValue();
                                }
                        }
                }

                return null;
        }
}