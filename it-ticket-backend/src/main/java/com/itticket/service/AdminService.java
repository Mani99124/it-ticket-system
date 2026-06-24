package com.itticket.service;

import com.itticket.dto.response.DashboardStatsResponse;
import com.itticket.dto.response.TicketResponse;
import com.itticket.dto.response.UserResponse;
import com.itticket.entity.User;
import com.itticket.enums.Role;
import com.itticket.enums.TicketStatus;
import com.itticket.enums.UserStatus;
import com.itticket.exception.BadRequestException;
import com.itticket.exception.ResourceNotFoundException;
import com.itticket.repository.TicketRepository;
import com.itticket.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final EmailService emailService;
    private final TicketService ticketService;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAllByRole(Role.USER)
                .stream().map(ticketService::toUserResponse).collect(Collectors.toList());
    }

    public List<UserResponse> getAllAgents() {
        return userRepository.findAllByRole(Role.AGENT)
                .stream().map(ticketService::toUserResponse).collect(Collectors.toList());
    }

    public List<UserResponse> getPendingAgents() {
        return userRepository.findAllByRoleAndStatus(Role.AGENT, UserStatus.PENDING)
                .stream().map(ticketService::toUserResponse).collect(Collectors.toList());
    }

    @Transactional
    public UserResponse approveAgent(Long agentId) {
        User agent = getAgent(agentId);
        if (agent.getStatus() != UserStatus.PENDING) {
            throw new BadRequestException("Agent is not in PENDING status");
        }
        agent.setStatus(UserStatus.ACTIVE);
        User saved = userRepository.save(agent);
        emailService.sendAgentApprovalEmail(saved);
        return ticketService.toUserResponse(saved);
    }

    @Transactional
    public UserResponse rejectAgent(Long agentId) {
        User agent = getAgent(agentId);
        agent.setStatus(UserStatus.REJECTED);
        User saved = userRepository.save(agent);
        emailService.sendAgentRejectionEmail(saved);
        return ticketService.toUserResponse(saved);
    }

    @Transactional
    public void deactivateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setStatus(UserStatus.INACTIVE);
        userRepository.save(user);
    }

    public DashboardStatsResponse getStats() {
        long totalUsers = userRepository.findAllByRole(Role.USER).size();
        long totalAgents = userRepository.findAllByRole(Role.AGENT).size();
        long pendingAgents = userRepository.findAllByRoleAndStatus(Role.AGENT, UserStatus.PENDING).size();
        long totalTickets = ticketRepository.count();
        long openTickets = ticketRepository.countByStatusIn(List.of(TicketStatus.OPEN));
        long inProgress = ticketRepository.countByStatusIn(List.of(TicketStatus.IN_PROGRESS));
        long resolved = ticketRepository.countByStatusIn(List.of(TicketStatus.RESOLVED));
        long closed = ticketRepository.countByStatusIn(List.of(TicketStatus.CLOSED));

        return DashboardStatsResponse.builder()
                .totalTickets(totalTickets)
                .openTickets(openTickets)
                .inProgressTickets(inProgress)
                .resolvedTickets(resolved)
                .closedTickets(closed)
                .totalUsers(totalUsers)
                .totalAgents(totalAgents)
                .pendingAgents(pendingAgents)
                .build();
    }

    private User getAgent(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));
        if (user.getRole() != Role.AGENT) {
            throw new BadRequestException("User is not an agent");
        }
        return user;
    }
}
