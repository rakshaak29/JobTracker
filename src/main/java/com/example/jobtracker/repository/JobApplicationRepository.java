package com.example.jobtracker.repository;

import com.example.jobtracker.model.JobApplication;
import com.example.jobtracker.model.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByStatus(ApplicationStatus status);

    // Search by company name (case-insensitive, partial match)
    List<JobApplication> findByCompanyNameContainingIgnoreCase(String companyName);

    // Filter by both status and company
    List<JobApplication> findByStatusAndCompanyNameContainingIgnoreCase(
            ApplicationStatus status, String companyName);
}
