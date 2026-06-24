package com.itticket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ItTicketApplication {
    public static void main(String[] args) {
        SpringApplication.run(ItTicketApplication.class, args);
    }
}
