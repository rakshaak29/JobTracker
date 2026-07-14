package com.example.jobtracker.controller;

import com.example.jobtracker.model.FollowUp;
import com.example.jobtracker.model.JobApplication;
import com.example.jobtracker.repository.FollowUpRepository;
import com.example.jobtracker.repository.JobApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@RestController
public class FollowUpController {

    @Autowired
    private FollowUpRepository followUpRepository;

    @Autowired
    private JobApplicationRepository applicationRepository;

    // POST /applications/5/follow-ups  → create a follow-up for an application
    @PostMapping("/applications/{appId}/follow-ups")
    public ResponseEntity<FollowUp> create(@PathVariable Long appId,
                                            @RequestBody FollowUp followUp) {
        return applicationRepository.findById(appId).map(app -> {
            followUp.setApplication(app);
            return ResponseEntity.ok(followUpRepository.save(followUp));
        }).orElse(ResponseEntity.notFound().build());
    }

    // GET /applications/5/follow-ups  → list follow-ups for one application
    @GetMapping("/applications/{appId}/follow-ups")
    public ResponseEntity<List<FollowUp>> getByApplication(@PathVariable Long appId) {
        if (!applicationRepository.existsById(appId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(followUpRepository.findByApplicationId(appId));
    }

    // GET /follow-ups/due-this-week  → what do I need to follow up on this week?
    @GetMapping("/follow-ups/due-this-week")
    public List<FollowUp> dueThisWeek() {
        LocalDate today = LocalDate.now();
        LocalDate endOfWeek = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
        return followUpRepository.findByCompletedFalseAndDueDateBetween(today, endOfWeek);
    }

    // GET /follow-ups/overdue  → what did I miss?
    @GetMapping("/follow-ups/overdue")
    public List<FollowUp> overdue() {
        return followUpRepository.findByCompletedFalseAndDueDateBefore(LocalDate.now());
    }

    // PUT /follow-ups/3/complete  → mark a follow-up as done
    @PutMapping("/follow-ups/{id}/complete")
    public ResponseEntity<FollowUp> markComplete(@PathVariable Long id) {
        return followUpRepository.findById(id).map(followUp -> {
            followUp.setCompleted(true);
            return ResponseEntity.ok(followUpRepository.save(followUp));
        }).orElse(ResponseEntity.notFound().build());
    }
}
