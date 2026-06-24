package com.itticket.dto.response;

import com.itticket.enums.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketHistoryResponse {
    private Long id;
    private Long ticketId;
    private UserResponse changedBy;
    private TicketStatus oldStatus;
    private TicketStatus newStatus;
    private String remarks;
    private LocalDateTime changedAt;
}
