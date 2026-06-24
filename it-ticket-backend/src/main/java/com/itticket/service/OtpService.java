package com.itticket.service;

import com.itticket.exception.BadRequestException;
import com.itticket.exception.OtpExpiredException;
import com.itticket.util.OtpGenerator;
import com.itticket.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final RedisUtil redisUtil;
    private final OtpGenerator otpGenerator;
    private static final long OTP_TTL_SECONDS = 300L;

    public String generateAndStoreOtp(String email) {
        String otp = otpGenerator.generateOtp();
        redisUtil.saveOtp(email, otp, OTP_TTL_SECONDS);
        return otp;
    }

    public void verifyOtp(String email, String submittedOtp) {
        String storedOtp = redisUtil.getOtp(email);
        if (storedOtp == null) {
            throw new OtpExpiredException("OTP has expired. Please request a new one.");
        }
        if (!storedOtp.equals(submittedOtp)) {
            throw new BadRequestException("Invalid OTP. Please check and try again.");
        }
        redisUtil.deleteOtp(email);
    }

    public String resendOtp(String email) {
        redisUtil.deleteOtp(email);
        return generateAndStoreOtp(email);
    }
}
