package com.itticket.service;

import com.itticket.dto.request.*;
import com.itticket.dto.response.AuthResponse;
import com.itticket.entity.RefreshToken;
import com.itticket.entity.User;
import com.itticket.enums.Role;
import com.itticket.enums.UserStatus;
import com.itticket.exception.BadRequestException;
import com.itticket.exception.ForbiddenException;
import com.itticket.exception.ResourceNotFoundException;
import com.itticket.exception.UnauthorizedException;
import com.itticket.repository.RefreshTokenRepository;
import com.itticket.repository.UserRepository;
import com.itticket.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final EmailService emailService;
    private final TokenBlacklistService tokenBlacklistService;

    @Transactional
    public void registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .status(UserStatus.UNVERIFIED)
                .build();
        userRepository.save(user);

        String otp = otpService.generateAndStoreOtp(request.getEmail());
        emailService.sendOtpEmail(request.getEmail(), otp);
    }

    // @Transactional
    // public void registerUser(RegisterRequest request) {
    // if (userRepository.existsByEmail(request.getEmail())) {
    // throw new BadRequestException("Email already registered");
    // }

    // User user = User.builder()
    // .name(request.getName())
    // .email(request.getEmail())
    // .password(passwordEncoder.encode(request.getPassword()))
    // .role(Role.USER)
    // .status(UserStatus.ACTIVE) // changed from UNVERIFIED
    // .build();

    // userRepository.save(user);

    // }

    @Transactional
    public void registerAgent(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        User agent = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.AGENT)
                .status(UserStatus.PENDING)
                .build();
        userRepository.save(agent);
    }

    @Transactional
    public void verifyOtp(OtpVerifyRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        otpService.verifyOtp(request.getEmail(), request.getOtp());
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
    }

    @Transactional
    public void resendOtp(ResendOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getStatus() == UserStatus.ACTIVE) {
            throw new BadRequestException("Account is already verified");
        }
        String otp = otpService.resendOtp(request.getEmail());
        emailService.sendOtpEmail(request.getEmail(), otp);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (user.getStatus() == UserStatus.UNVERIFIED) {
            throw new ForbiddenException("Please verify your email before logging in");
        }
        if (user.getStatus() == UserStatus.PENDING) {
            throw new ForbiddenException("Your account is pending admin approval");
        }
        if (user.getStatus() == UserStatus.REJECTED) {
            throw new ForbiddenException("Your account application has been rejected");
        }
        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new ForbiddenException("Your account has been deactivated");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getEmail(), user.getRole().name(), user.getId());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

        // Persist refresh token
        saveRefreshToken(user, refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .refreshTokenString(refreshToken) // Added for controller to set cookie
                .build();
    }

    @Transactional
    public AuthResponse refresh(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new UnauthorizedException("Invalid or expired refresh token. Please login again.");
        }

        RefreshToken stored = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new UnauthorizedException("Refresh token not found. Please login again."));

        if (stored.isRevoked() || stored.getExpiry().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Refresh token has been revoked or expired. Please login again.");
        }

        User user = stored.getUser();
        String newAccessToken = jwtTokenProvider.generateAccessToken(
                user.getEmail(), user.getRole().name(), user.getId());

        // Rotate refresh token
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());
        saveRefreshToken(user, newRefreshToken);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .refreshTokenString(newRefreshToken) // Added for controller to set cookie
                .build();
    }

    @Transactional
    public void logout(String accessToken) {
        long ttl = jwtTokenProvider.getRemainingTtlSeconds(accessToken);
        tokenBlacklistService.blacklist(accessToken, ttl);

        try {
            String email = jwtTokenProvider.extractEmail(accessToken);
            userRepository.findByEmail(email).ifPresent(user -> refreshTokenRepository.deleteAllByUser(user));
        } catch (Exception e) {
            log.warn("Could not revoke refresh tokens during logout: {}", e.getMessage());
        }
    }

    private void saveRefreshToken(User user, String token) {
        RefreshToken tokenEntity = RefreshToken.builder()
                .user(user)
                .token(token)
                .expiry(LocalDateTime.now().plusDays(7))
                .build();
        refreshTokenRepository.save(tokenEntity);
    }
}
