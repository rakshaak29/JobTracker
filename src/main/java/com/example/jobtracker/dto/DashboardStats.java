package com.example.jobtracker.dto;

import com.example.jobtracker.model.ApplicationStatus;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class DashboardStats {
    private long totalApplications;
    private Map<ApplicationStatus, Long> statusCounts;
    private double responseRate;
    private double averageTimeToRespondDays;
}
