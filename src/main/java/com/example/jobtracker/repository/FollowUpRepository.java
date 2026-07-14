package com.example.jobtracker.repository;

import com.example.jobtracker.model.FollowUp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface FollowUpRepository extends JpaRepository<FollowUp, Long> {

    // All follow-ups for a specific application
    List<FollowUp> findByApplicationId(Long applicationId);

    // All incomplete follow-ups due between two dates (e.g. this week)
    List<FollowUp> findByCompletedFalseAndDueDateBetween(LocalDate start, LocalDate end);

    // All overdue follow-ups (due before today and not completed)
    List<FollowUp> findByCompletedFalseAndDueDateBefore(LocalDate date);
}
