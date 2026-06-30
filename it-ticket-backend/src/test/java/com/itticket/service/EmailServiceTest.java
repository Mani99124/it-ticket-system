package com.itticket.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(emailService, "mailEnabled", false);
        ReflectionTestUtils.setField(emailService, "fromEmail", "noreply@example.com");
    }

    @Test
    void sendOtpEmailSkipsMailWhenDisabled() {
        emailService.sendOtpEmail("user@example.com", "123456");

        verifyNoInteractions(mailSender);
    }
}
