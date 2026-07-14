package com.example.jobtracker.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "follow_ups")
@Getter
@Setter
public class FollowUp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Which application is this follow-up for?
    @ManyToOne
    @JoinColumn(name = "application_id", nullable = false)
    private JobApplication application;

    private LocalDate dueDate;

    private String note;       // e.g. "Send thank-you email", "Check portal"

    private boolean completed;  // mark as done when you've followed up
}
