package com.itticket.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
@Slf4j
public class JwtTokenProvider {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.access-token-expiry}")
    private long accessTokenExpiry;

    @Value("${app.jwt.refresh-token-expiry}")
    private long refreshTokenExpiry;

    private SecretKey getSigningKey() {
        String resolvedSecret = jwtSecret;
        if (!StringUtils.hasText(resolvedSecret)) {
            resolvedSecret = "change-me-in-production";
        }

        byte[] keyBytes = Decoders.BASE64.decode(resolveBase64Secret(resolvedSecret));
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private String resolveBase64Secret(String secret) {
        if (StringUtils.hasText(secret)) {
            try {
                Decoders.BASE64.decode(secret);
                return secret;
            } catch (IllegalArgumentException ignored) {
                return java.util.Base64.getEncoder()
                        .encodeToString(secret.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            }
        }
        return java.util.Base64.getEncoder()
                .encodeToString("change-me-in-production".getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    public String generateAccessToken(String email, String role, Long userId) {
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .claim("userId", userId)
                .claim("type", "access")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessTokenExpiry))
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(String email) {
        return Jwts.builder()
                .subject(email)
                .claim("type", "refresh")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshTokenExpiry))
                .signWith(getSigningKey())
                .compact();
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    public Date extractExpiration(String token) {
        return extractAllClaims(token).getExpiration();
    }

    public long getRemainingTtlSeconds(String token) {
        Date expiry = extractExpiration(token);
        long diff = expiry.getTime() - System.currentTimeMillis();
        return Math.max(diff / 1000, 0);
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("JWT expired: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.warn("Malformed JWT: {}", e.getMessage());
        } catch (SecurityException e) {
            log.warn("JWT security error: {}", e.getMessage());
        } catch (Exception e) {
            log.warn("JWT validation error: {}", e.getMessage());
        }
        return false;
    }
}
