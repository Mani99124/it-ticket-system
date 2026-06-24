package com.itticket.controller;

import com.itticket.dto.request.UpdateStatusRequest;
import com.itticket.dto.response.ApiResponse;
import com.itticket.dto.response.TicketResponse;
import com.itticket.dto.response.UserResponse;
import com.itticket.entity.User;
import com.itticket.exception.ResourceNotFoundException;
import com.itticket.repository.UserRepository;
import com.itticket.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agent")
@PreAuthorize("hasRole('AGENT')")
@RequiredArgsConstructor
public class AgentController {

    private final TicketService ticketService;
    private final UserRepository userRepository;

    @GetMapping("/tickets")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getMyTickets(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Tickets fetched",
                ticketService.getAgentTickets(userDetails.getUsername())));
    }

    @GetMapping("/tickets/{id}")
    public ResponseEntity<ApiResponse<TicketResponse>> getTicketById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Ticket fetched",
                ticketService.getTicketById(id, userDetails.getUsername())));
    }

    @PutMapping("/tickets/{id}/status")
    public ResponseEntity<ApiResponse<TicketResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                ticketService.updateStatus(id, request, userDetails.getUsername())));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        User agent = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));
        return ResponseEntity.ok(ApiResponse.success("Profile fetched",
                ticketService.toUserResponse(agent)));
    }
}
