package com.example.jobtracker.controller;

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

@RestController
@RequestMapping("/applications")
public class JobApplicationController {

    @Autowired
    private JobApplicationRepository repository;

    @Autowired
    private StatusHistoryRepository historyRepository;

    // GET /applications
    @GetMapping
    public List<JobApplication> getAll(@RequestParam(required = false) ApplicationStatus status) {
        if (status != null) {
            return repository.findByStatus(status);
        }
        return repository.findAll();
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
