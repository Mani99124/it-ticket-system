package com.itticket.service;

import com.itticket.entity.Ticket;
import com.itticket.entity.TicketComment;
import com.itticket.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${spring.mail.port:587}")
    private int mailPort;

    @Value("${app.mail.enabled:true}")
    private boolean mailEnabled;

    @Async("emailTaskExecutor")
    public void sendOtpEmail(String toEmail, String otp) {
        send(
                toEmail,
                "Email Verification - IT Ticket System",
                "Your OTP for email verification is: " + otp +
                        "\n\nThis OTP will expire in 5 minutes." +
                        "\n\nDo not share this OTP with anyone.");
    }

    @Async("emailTaskExecutor")
    public void sendAgentApprovalEmail(User agent) {
        send(
                agent.getEmail(),
                "Account Approved - IT Ticket System",
                "Dear " + agent.getName() + ",\n\n" +
                        "Congratulations! Your agent account has been approved.\n" +
                        "You can now login and start managing tickets.\n\n" +
                        "IT Support Team");
    }

    @Async("emailTaskExecutor")
    public void sendAgentRejectionEmail(User agent) {
        send(
                agent.getEmail(),
                "Account Application - IT Ticket System",
                "Dear " + agent.getName() + ",\n\n" +
                        "We regret to inform you that your agent account application has been rejected.\n" +
                        "Please contact the administrator for more information.\n\n" +
                        "IT Support Team");
    }

    @Async("emailTaskExecutor")
    public void sendTicketCreatedEmail(User user, Ticket ticket) {
        send(
                user.getEmail(),
                "Ticket Created - #" + ticket.getId(),
                "Dear " + user.getName() + ",\n\n" +
                        "Your support ticket has been successfully created.\n\n" +
                        "Ticket ID: #" + ticket.getId() + "\n" +
                        "Title: " + ticket.getTitle() + "\n" +
                        "Priority: " + ticket.getPriority() + "\n" +
                        "Status: " + ticket.getStatus() + "\n\n" +
                        "Our team will get back to you shortly.\n\n" +
                        "IT Support Team");
    }

    @Async("emailTaskExecutor")
    public void sendTicketAssignedEmail(User agent, Ticket ticket) {
        send(
                agent.getEmail(),
                "New Ticket Assigned - #" + ticket.getId(),
                "Dear " + agent.getName() + ",\n\n" +
                        "A new ticket has been assigned to you.\n\n" +
                        "Ticket ID: #" + ticket.getId() + "\n" +
                        "Title: " + ticket.getTitle() + "\n" +
                        "Priority: " + ticket.getPriority() + "\n" +
                        "Category: " +
                        (ticket.getCategory() != null ? ticket.getCategory() : "N/A") +
                        "\n\nPlease review and take action as soon as possible.\n\n" +
                        "IT Support Team");
    }

    @Async("emailTaskExecutor")
    public void sendStatusUpdateEmail(User user, Ticket ticket) {
        send(
                user.getEmail(),
                "Ticket Status Updated - #" + ticket.getId(),
                "Dear " + user.getName() + ",\n\n" +
                        "The status of your ticket has been updated.\n\n" +
                        "Ticket ID: #" + ticket.getId() + "\n" +
                        "Title: " + ticket.getTitle() + "\n" +
                        "New Status: " + ticket.getStatus() + "\n\n" +
                        "IT Support Team");
    }

    @Async("emailTaskExecutor")
    public void sendTicketResolvedEmail(User user, Ticket ticket) {
        send(
                user.getEmail(),
                "Ticket Resolved - #" + ticket.getId(),
                "Dear " + user.getName() + ",\n\n" +
                        "Your support ticket has been resolved.\n\n" +
                        "Ticket ID: #" + ticket.getId() + "\n" +
                        "Title: " + ticket.getTitle() + "\n\n" +
                        "If issue persists, you may reopen the ticket.\n\n" +
                        "IT Support Team");
    }

    @Async("emailTaskExecutor")
    public void sendCommentNotificationEmail(
            User recipient,
            Ticket ticket,
            TicketComment comment) {
        send(
                recipient.getEmail(),
                "New Comment on Ticket - #" + ticket.getId(),
                "Dear " + recipient.getName() + ",\n\n" +
                        "A new comment has been added.\n\n" +
                        "Comment by: " + comment.getAuthor().getName() + "\n" +
                        "Comment: " + comment.getContent() + "\n\n" +
                        "IT Support Team");
    }

    @Async("emailTaskExecutor")
    public void sendNoAgentAvailableEmail(String adminEmail, Ticket ticket) {
        send(
                adminEmail,
                "ALERT: No Agents Available - Ticket #" + ticket.getId(),
                "Ticket created but no active agents are available.\n\n" +
                        "Ticket ID: #" + ticket.getId() + "\n" +
                        "Title: " + ticket.getTitle() + "\n" +
                        "Priority: " + ticket.getPriority());
    }

    private void send(String to, String subject, String body) {

        if (!mailEnabled) {
            log.warn("Email disabled");
            return;
        }

        if (!StringUtils.hasText(fromEmail)) {
            log.error("MAIL_USERNAME missing");
            return;
        }

        if (!StringUtils.hasText(mailHost)) {
            log.error("SPRING_MAIL_HOST missing");
            return;
        }

        if (!StringUtils.hasText(to)) {
            log.error("Recipient email missing");
            return;
        }

        try {

            log.info(
                    "Sending mail | host={} | port={} | from={} | to={}",
                    mailHost,
                    mailPort,
                    fromEmail,
                    to);

            SimpleMailMessage message = new SimpleMailMessage();

            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);

            log.info("Email sent successfully → {}", to);

        } catch (Exception e) {
            log.error("Email sending failed", e);
        }
    }
}