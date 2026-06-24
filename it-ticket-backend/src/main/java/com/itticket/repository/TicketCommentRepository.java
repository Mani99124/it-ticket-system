package com.itticket.repository;

import com.itticket.entity.Ticket;
import com.itticket.entity.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {
    List<TicketComment> findAllByTicketOrderByCreatedAtAsc(Ticket ticket);
}
