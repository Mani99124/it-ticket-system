package com.itticket.controller;

import com.itticket.dto.request.AddCommentRequest;
import com.itticket.dto.request.CreateTicketRequest;
import com.itticket.dto.request.UpdateStatusRequest;
import com.itticket.dto.response.*;
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
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<ApiResponse<TicketResponse>> createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TicketResponse ticket = ticketService.createTicket(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Ticket created successfully", ticket));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getMyTickets(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<TicketResponse> tickets = ticketService.getUserTickets(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Tickets fetched", tickets));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','AGENT','ADMIN')")
    public ResponseEntity<ApiResponse<TicketResponse>> getTicketById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        TicketResponse ticket = ticketService.getTicketById(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Ticket fetched", ticket));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('AGENT','ADMIN')")
    public ResponseEntity<ApiResponse<TicketResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TicketResponse ticket = ticketService.updateStatus(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Status updated", ticket));
    }

    @PutMapping("/{id}/close")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<TicketResponse>> closeTicket(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        TicketResponse ticket = ticketService.closeTicket(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Ticket closed", ticket));
    }

    @PutMapping("/{id}/reopen")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<TicketResponse>> reopenTicket(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        TicketResponse ticket = ticketService.reopenTicket(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Ticket reopened", ticket));
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("hasAnyRole('USER','AGENT','ADMIN')")
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @PathVariable Long id,
            @Valid @RequestBody AddCommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        CommentResponse comment = ticketService.addComment(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Comment added", comment));
    }

    @GetMapping("/{id}/comments")
    @PreAuthorize("hasAnyRole('USER','AGENT','ADMIN')")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Comments fetched", ticketService.getComments(id)));
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('USER','AGENT','ADMIN')")
    public ResponseEntity<ApiResponse<List<TicketHistoryResponse>>> getHistory(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("History fetched", ticketService.getHistory(id)));
    }
}
