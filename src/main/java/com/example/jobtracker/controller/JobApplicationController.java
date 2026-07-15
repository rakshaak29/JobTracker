package com.example.jobtracker.controller;

import com.example.jobtracker.dto.DashboardStats;
import com.example.jobtracker.model.JobApplication;
import com.example.jobtracker.model.ApplicationStatus;
import com.example.jobtracker.model.StatusHistory;
import com.example.jobtracker.repository.JobApplicationRepository;
import com.example.jobtracker.repository.StatusHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/applications")
public class JobApplicationController {

    @Autowired
    private JobApplicationRepository repository;

    @Autowired
    private StatusHistoryRepository historyRepository;

    // GET /applications?status=INTERVIEW&company=Google
    @GetMapping
    public List<JobApplication> getAll(
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) String company) {
        if (status != null && company != null) {
            return repository.findByStatusAndCompanyNameContainingIgnoreCase(status, company);
        } else if (status != null) {
            return repository.findByStatus(status);
        } else if (company != null) {
            return repository.findByCompanyNameContainingIgnoreCase(company);
        }
        return repository.findAll();
    }
        // GET /applications/stats  → retrieve job application statistics
    @GetMapping("/stats")
    public DashboardStats getStats() {
        List<JobApplication> apps = repository.findAll();
        List<StatusHistory> history = historyRepository.findAll();

        DashboardStats stats = new DashboardStats();
        stats.setTotalApplications(apps.size());

        // 1. Calculate status counts (initialize all statuses to 0)
        Map<ApplicationStatus, Long> counts = new java.util.HashMap<>();
        for (ApplicationStatus status : ApplicationStatus.values()) {
            counts.put(status, 0L);
        }
        for (JobApplication app : apps) {
            counts.put(app.getStatus(), counts.get(app.getStatus()) + 1);
        }
        stats.setStatusCounts(counts);

        if (apps.isEmpty()) {
            stats.setResponseRate(0.0);
            stats.setAverageTimeToRespondDays(0.0);
            return stats;
        }

        // 2. Calculate response rate (percentage of applications that moved out of APPLIED)
        long respondedCount = apps.stream()
                .filter(app -> app.getStatus() != ApplicationStatus.APPLIED)
                .count();
        double responseRate = ((double) respondedCount / apps.size()) * 100.0;
        stats.setResponseRate(Math.round(responseRate * 100.0) / 100.0); // Round to 2 decimal places

        // 3. Calculate average time-to-respond in days
        List<Long> responseTimesInDays = new java.util.ArrayList<>();
        for (JobApplication app : apps) {
            if (app.getStatus() == ApplicationStatus.APPLIED) {
                continue;
            }

            // Find the earliest status change where status moved out of APPLIED
            history.stream()
                .filter(h -> h.getApplication().getId().equals(app.getId()))
                .filter(h -> h.getNewStatus() != ApplicationStatus.APPLIED)
                .min(java.util.Comparator.comparing(StatusHistory::getChangedAt))
                .ifPresent(firstResponse -> {
                    long days = java.time.temporal.ChronoUnit.DAYS.between(
                        app.getDateApplied(),
                        firstResponse.getChangedAt().toLocalDate()
                    );
                    responseTimesInDays.add(days);
                });
        }

        double averageDays = responseTimesInDays.stream()
                .mapToLong(Long::longValue)
                .average()
                .orElse(0.0);
        stats.setAverageTimeToRespondDays(Math.round(averageDays * 100.0) / 100.0); // Round to 2 decimal places

        return stats;
    }


    // GET /applications/5
    @GetMapping("/{id}")
    public ResponseEntity<JobApplication> getOne(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    // POST /applications  → create + log initial status
    @PostMapping
    public JobApplication create(@RequestBody JobApplication application) {
        JobApplication saved = repository.save(application);

        // Log the initial status
        StatusHistory history = new StatusHistory();
        history.setApplication(saved);
        history.setOldStatus(null);
        history.setNewStatus(saved.getStatus());
        history.setChangedAt(LocalDateTime.now());
        historyRepository.save(history);

        return saved;
    }

    // PUT /applications/5  → update + log status change if status changed
    @PutMapping("/{id}")
    public ResponseEntity<JobApplication> update(@PathVariable Long id,
                                                  @RequestBody JobApplication updated) {
        return repository.findById(id).map(existing -> {
            // Check if status is changing
            ApplicationStatus oldStatus = existing.getStatus();
            ApplicationStatus newStatus = updated.getStatus();

            existing.setCompanyName(updated.getCompanyName());
            existing.setRoleTitle(updated.getRoleTitle());
            existing.setStatus(updated.getStatus());
            existing.setDateApplied(updated.getDateApplied());
            existing.setSource(updated.getSource());
            existing.setJobPostingUrl(updated.getJobPostingUrl());
            existing.setNotes(updated.getNotes());

            JobApplication saved = repository.save(existing);

            // Only log if status actually changed
            if (newStatus != null && newStatus != oldStatus) {
                StatusHistory history = new StatusHistory();
                history.setApplication(saved);
                history.setOldStatus(oldStatus);
                history.setNewStatus(newStatus);
                history.setChangedAt(LocalDateTime.now());
                historyRepository.save(history);
            }

            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    // DELETE /applications/5
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // GET /applications/5/history  → view status history for one application
    @GetMapping("/{id}/history")
    public ResponseEntity<List<StatusHistory>> getHistory(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        List<StatusHistory> history = historyRepository.findByApplicationIdOrderByChangedAtAsc(id);
        return ResponseEntity.ok(history);
    }
}
