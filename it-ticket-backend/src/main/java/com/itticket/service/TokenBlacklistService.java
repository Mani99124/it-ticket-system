package com.itticket.service;

import com.itticket.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    private final RedisUtil redisUtil;

    public void blacklist(String token, long ttlSeconds) {
        redisUtil.blacklistToken(token, ttlSeconds);
    }

    public boolean isBlacklisted(String token) {
        return redisUtil.isTokenBlacklisted(token);
    }
}
