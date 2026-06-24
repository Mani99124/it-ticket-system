package com.itticket.dto.request;

import com.itticket.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateStatusRequest {
    @NotNull
    private TicketStatus status;

    private String remarks;
}
