package com.example.jobtracker.repository;

import com.example.jobtracker.model.StatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StatusHistoryRepository extends JpaRepository<StatusHistory, Long> {

    // "Find all history entries for a given application ID, ordered by date"
    // Spring reads the method name and generates the SQL!
    List<StatusHistory> findByApplicationIdOrderByChangedAtAsc(Long applicationId);
}

