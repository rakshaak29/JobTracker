package com.example.jobtracker.repository;

import com.example.jobtracker.model.JobApplication;
import com.example.jobtracker.model.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    // Spring auto-generates the SQL from the method name!
    // This becomes: SELECT * FROM applications WHERE status = ?
    List<JobApplication> findByStatus(ApplicationStatus status);
}
