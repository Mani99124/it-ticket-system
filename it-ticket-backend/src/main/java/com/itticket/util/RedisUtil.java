package com.itticket.util;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class RedisUtil {

    private final RedisTemplate<String, String> redisTemplate;

    private static final String OTP_PREFIX = "OTP:";
    private static final String BLACKLIST_PREFIX = "BLACKLIST:";

    // OTP operations
    public void saveOtp(String email, String otp, long ttlSeconds) {
        redisTemplate.opsForValue().set(OTP_PREFIX + email, otp, ttlSeconds, TimeUnit.SECONDS);
    }

    public String getOtp(String email) {
        return redisTemplate.opsForValue().get(OTP_PREFIX + email);
    }

    public void deleteOtp(String email) {
        redisTemplate.delete(OTP_PREFIX + email);
    }

    // Token blacklist operations
    public void blacklistToken(String token, long ttlSeconds) {
        if (ttlSeconds > 0) {
            redisTemplate.opsForValue().set(BLACKLIST_PREFIX + token, "true", ttlSeconds, TimeUnit.SECONDS);
        }
    }

    public boolean isTokenBlacklisted(String token) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(BLACKLIST_PREFIX + token));
    }
}
