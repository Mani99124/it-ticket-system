package com.itticket.controller;

import com.itticket.dto.request.UpdateStatusRequest;
import com.itticket.dto.response.*;
import com.itticket.service.AdminService;
import com.itticket.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final TicketService ticketService;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success("Users fetched", adminService.getAllUsers()));
    }

    @GetMapping("/agents")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllAgents() {
        return ResponseEntity.ok(ApiResponse.success("Agents fetched", adminService.getAllAgents()));
    }

    @GetMapping("/agents/pending")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getPendingAgents() {
        return ResponseEntity.ok(ApiResponse.success("Pending agents fetched", adminService.getPendingAgents()));
    }

    @PutMapping("/agents/{id}/approve")
    public ResponseEntity<ApiResponse<UserResponse>> approveAgent(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Agent approved", adminService.approveAgent(id)));
    }

    @PutMapping("/agents/{id}/reject")
    public ResponseEntity<ApiResponse<UserResponse>> rejectAgent(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Agent rejected", adminService.rejectAgent(id)));
    }

    @GetMapping("/tickets")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getAllTickets() {
        return ResponseEntity.ok(ApiResponse.success("All tickets fetched", ticketService.getAllTickets()));
    }

    @PutMapping("/tickets/{ticketId}/assign")
    public ResponseEntity<ApiResponse<TicketResponse>> assignTicket(
            @PathVariable Long ticketId,
            @RequestParam Long agentId) {
        return ResponseEntity.ok(ApiResponse.success("Ticket assigned",
                ticketService.adminAssign(ticketId, agentId)));
    }

    @PutMapping("/tickets/{id}/status")
    public ResponseEntity<ApiResponse<TicketResponse>> updateTicketStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                ticketService.updateStatus(id, request, "admin")));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success("Stats fetched", adminService.getStats()));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deactivateUser(@PathVariable Long id) {
        adminService.deactivateUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deactivated"));
    }
}
