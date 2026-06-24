package com.itticket.service;

import com.itticket.entity.Ticket;
import com.itticket.entity.User;
import com.itticket.enums.Role;
import com.itticket.enums.TicketStatus;
import com.itticket.enums.UserStatus;
import com.itticket.repository.TicketRepository;
import com.itticket.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AgentAssignmentService {

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final EmailService emailService;

    private static final List<TicketStatus> ACTIVE_STATUSES = List.of(
            TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.REOPENED);

    public Optional<User> assignLeastBusyAgent(Ticket ticket) {
        List<User> activeAgents = userRepository.findAllByRoleAndStatus(Role.AGENT, UserStatus.ACTIVE);

        if (activeAgents.isEmpty()) {
            log.warn("No active agents available for ticket #{}", ticket.getId());
            return Optional.empty();
        }

        User leastBusy = activeAgents.stream()
                .min(Comparator.comparingLong(agent ->
                        ticketRepository.countByAssignedToAndStatusIn(agent, ACTIVE_STATUSES)))
                .orElse(activeAgents.get(0));

        log.info("Assigning ticket #{} to agent {} ({})", ticket.getId(), leastBusy.getName(), leastBusy.getEmail());
        return Optional.of(leastBusy);
    }
}
