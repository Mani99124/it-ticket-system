package com.itticket.service;

import com.itticket.dto.request.AddCommentRequest;
import com.itticket.dto.request.CreateTicketRequest;
import com.itticket.dto.request.UpdateStatusRequest;
import com.itticket.dto.response.CommentResponse;
import com.itticket.dto.response.TicketHistoryResponse;
import com.itticket.dto.response.TicketResponse;
import com.itticket.dto.response.UserResponse;
import com.itticket.entity.Ticket;
import com.itticket.entity.TicketComment;
import com.itticket.entity.TicketHistory;
import com.itticket.entity.User;
import com.itticket.enums.Role;
import com.itticket.enums.TicketStatus;
import com.itticket.exception.BadRequestException;
import com.itticket.exception.ForbiddenException;
import com.itticket.exception.ResourceNotFoundException;
import com.itticket.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final TicketHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final AgentAssignmentService assignmentService;
    private final EmailService emailService;

    @Transactional
    public TicketResponse createTicket(CreateTicketRequest request, String creatorEmail) {
        User creator = getUserByEmail(creatorEmail);

        Ticket ticket = Ticket.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .status(TicketStatus.OPEN)
                .category(request.getCategory())
                .createdBy(creator)
                .build();

        Ticket saved = ticketRepository.save(ticket);

        // Assign to least busy agent
        assignmentService.assignLeastBusyAgent(saved).ifPresentOrElse(
                agent -> {
                    saved.setAssignedTo(agent);
                    ticketRepository.save(saved);
                    emailService.sendTicketAssignedEmail(agent, saved);
                },
                () -> emailService.sendNoAgentAvailableEmail(getAdminEmail(), saved)
        );

        emailService.sendTicketCreatedEmail(creator, saved);
        recordHistory(saved, null, TicketStatus.OPEN, creator, "Ticket created");
        return toResponse(saved);
    }

    public List<TicketResponse> getUserTickets(String email) {
        User user = getUserByEmail(email);
        return ticketRepository.findAllByCreatedBy(user)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<TicketResponse> getAgentTickets(String email) {
        User agent = getUserByEmail(email);
        return ticketRepository.findAllByAssignedTo(agent)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAll()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public TicketResponse getTicketById(Long id, String requesterEmail) {
        Ticket ticket = findTicket(id);
        User requester = getUserByEmail(requesterEmail);

        if (requester.getRole() == Role.USER && !ticket.getCreatedBy().getId().equals(requester.getId())) {
            throw new ForbiddenException("Access denied to this ticket");
        }
        if (requester.getRole() == Role.AGENT &&
            (ticket.getAssignedTo() == null || !ticket.getAssignedTo().getId().equals(requester.getId()))) {
            throw new ForbiddenException("This ticket is not assigned to you");
        }
        return toResponse(ticket);
    }

    @Transactional
    public TicketResponse updateStatus(Long id, UpdateStatusRequest request, String requesterEmail) {
        Ticket ticket = findTicket(id);
        User requester = getUserByEmail(requesterEmail);

        TicketStatus oldStatus = ticket.getStatus();
        TicketStatus newStatus = request.getStatus();

        ticket.setStatus(newStatus);
        if (newStatus == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
            emailService.sendTicketResolvedEmail(ticket.getCreatedBy(), ticket);
        } else {
            emailService.sendStatusUpdateEmail(ticket.getCreatedBy(), ticket);
        }

        Ticket saved = ticketRepository.save(ticket);
        recordHistory(saved, oldStatus, newStatus, requester, request.getRemarks());
        return toResponse(saved);
    }

    @Transactional
    public TicketResponse closeTicket(Long id, String userEmail) {
        Ticket ticket = findTicket(id);
        User user = getUserByEmail(userEmail);

        if (!ticket.getCreatedBy().getId().equals(user.getId())) {
            throw new ForbiddenException("Only the ticket creator can close it");
        }
        if (ticket.getStatus() != TicketStatus.RESOLVED) {
            throw new BadRequestException("Only resolved tickets can be closed");
        }
        TicketStatus old = ticket.getStatus();
        ticket.setStatus(TicketStatus.CLOSED);
        Ticket saved = ticketRepository.save(ticket);
        recordHistory(saved, old, TicketStatus.CLOSED, user, "Ticket closed by user");
        return toResponse(saved);
    }

    @Transactional
    public TicketResponse reopenTicket(Long id, String userEmail) {
        Ticket ticket = findTicket(id);
        User user = getUserByEmail(userEmail);

        if (!ticket.getCreatedBy().getId().equals(user.getId())) {
            throw new ForbiddenException("Only the ticket creator can reopen it");
        }
        if (ticket.getStatus() != TicketStatus.RESOLVED && ticket.getStatus() != TicketStatus.CLOSED) {
            throw new BadRequestException("Only resolved or closed tickets can be reopened");
        }
        TicketStatus old = ticket.getStatus();
        ticket.setStatus(TicketStatus.REOPENED);
        Ticket saved = ticketRepository.save(ticket);
        recordHistory(saved, old, TicketStatus.REOPENED, user, "Ticket reopened by user");
        return toResponse(saved);
    }

    @Transactional
    public CommentResponse addComment(Long ticketId, AddCommentRequest request, String authorEmail) {
        Ticket ticket = findTicket(ticketId);
        User author = getUserByEmail(authorEmail);

        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new BadRequestException("Cannot comment on a closed ticket");
        }

        TicketComment comment = TicketComment.builder()
                .ticket(ticket)
                .author(author)
                .content(request.getContent())
                .build();
        TicketComment saved = commentRepository.save(comment);

        // Notify the other party
        if (author.getRole() == Role.USER && ticket.getAssignedTo() != null) {
            emailService.sendCommentNotificationEmail(ticket.getAssignedTo(), ticket, saved);
        } else if (author.getRole() == Role.AGENT) {
            emailService.sendCommentNotificationEmail(ticket.getCreatedBy(), ticket, saved);
        }

        return toCommentResponse(saved);
    }

    public List<CommentResponse> getComments(Long ticketId) {
        Ticket ticket = findTicket(ticketId);
        return commentRepository.findAllByTicketOrderByCreatedAtAsc(ticket)
                .stream().map(this::toCommentResponse).collect(Collectors.toList());
    }

    public List<TicketHistoryResponse> getHistory(Long ticketId) {
        Ticket ticket = findTicket(ticketId);
        return historyRepository.findAllByTicketOrderByChangedAtAsc(ticket)
                .stream().map(this::toHistoryResponse).collect(Collectors.toList());
    }

    @Transactional
    public TicketResponse adminAssign(Long ticketId, Long agentId) {
        Ticket ticket = findTicket(ticketId);
        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));
        if (agent.getRole() != Role.AGENT) {
            throw new BadRequestException("User is not an agent");
        }
        ticket.setAssignedTo(agent);
        Ticket saved = ticketRepository.save(ticket);
        emailService.sendTicketAssignedEmail(agent, saved);
        return toResponse(saved);
    }

    // ─── Private helpers ────────────────────────────────────────────────────────

    private Ticket findTicket(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private void recordHistory(Ticket ticket, TicketStatus oldStatus, TicketStatus newStatus,
                               User changedBy, String remarks) {
        TicketHistory history = TicketHistory.builder()
                .ticket(ticket)
                .changedBy(changedBy)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .remarks(remarks)
                .build();
        historyRepository.save(history);
    }

    private String getAdminEmail() {
        return userRepository.findAllByRole(Role.ADMIN)
                .stream().findFirst()
                .map(User::getEmail)
                .orElse("admin@itticket.com");
    }

    public TicketResponse toResponse(Ticket t) {
        return TicketResponse.builder()
                .id(t.getId())
                .title(t.getTitle())
                .description(t.getDescription())
                .priority(t.getPriority())
                .status(t.getStatus())
                .category(t.getCategory())
                .createdBy(toUserResponse(t.getCreatedBy()))
                .assignedTo(t.getAssignedTo() != null ? toUserResponse(t.getAssignedTo()) : null)
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .resolvedAt(t.getResolvedAt())
                .build();
    }

    public UserResponse toUserResponse(User u) {
        return UserResponse.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .role(u.getRole())
                .status(u.getStatus())
                .createdAt(u.getCreatedAt())
                .build();
    }

    private CommentResponse toCommentResponse(TicketComment c) {
        return CommentResponse.builder()
                .id(c.getId())
                .ticketId(c.getTicket().getId())
                .author(toUserResponse(c.getAuthor()))
                .content(c.getContent())
                .createdAt(c.getCreatedAt())
                .build();
    }

    private TicketHistoryResponse toHistoryResponse(TicketHistory h) {
        return TicketHistoryResponse.builder()
                .id(h.getId())
                .ticketId(h.getTicket().getId())
                .changedBy(toUserResponse(h.getChangedBy()))
                .oldStatus(h.getOldStatus())
                .newStatus(h.getNewStatus())
                .remarks(h.getRemarks())
                .changedAt(h.getChangedAt())
                .build();
    }
}
