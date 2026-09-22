package com.pheonix.aerocloudbackend.assets;

public record Statistics(
        String droneCode,
        Double latitude,
        Double longitude,
        Double altitude,
        Double temperature,
        Double survivorProbability,
        Boolean structuralGapFound,
        String timestamp
) {}
