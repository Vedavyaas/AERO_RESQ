package com.pheonix.aerocloudbackend.assets;

public record StatisticDTO(
        Long id,
        Double latitude,
        Double longitude,
        Double altitude,
        Double temperature,
        Double survivorProbability,
        Boolean structuralGapFound,
        String timestamp
) {}
