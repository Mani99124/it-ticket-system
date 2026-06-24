package com.itticket.repository;

import com.itticket.entity.Ticket;
import com.itticket.entity.User;
import com.itticket.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findAllByCreatedBy(User user);
    List<Ticket> findAllByAssignedTo(User agent);
    long countByAssignedToAndStatusIn(User agent, List<TicketStatus> statuses);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.status IN :statuses")
    long countByStatusIn(List<TicketStatus> statuses);
}
