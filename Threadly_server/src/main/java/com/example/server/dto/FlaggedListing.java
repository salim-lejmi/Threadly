package com.example.server.dto;

import com.example.server.model.Thread;

public record FlaggedListing(Thread thread, Double riskScore) {
}