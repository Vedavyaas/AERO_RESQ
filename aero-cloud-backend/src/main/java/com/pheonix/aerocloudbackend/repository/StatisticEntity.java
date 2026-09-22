package com.pheonix.aerocloudbackend.repository;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class StatisticEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "statistic_mission_id")
    private MissionEntity missionEntity;

    private Double latitude;
    private Double longitude;
    private Double altitude;
    private Double temperature;
    private Double survivorProbability;
    private Boolean structuralGapFound;
    private LocalDateTime timestamp;

    public StatisticEntity() {
    }

    public StatisticEntity(MissionEntity missionEntity, Double latitude, Double longitude, Double altitude, Double temperature, Double survivorProbability, Boolean structuralGapFound, LocalDateTime timestamp) {
        this.missionEntity = missionEntity;
        this.latitude = latitude;
        this.longitude = longitude;
        this.altitude = altitude;
        this.temperature = temperature;
        this.survivorProbability = survivorProbability;
        this.structuralGapFound = structuralGapFound;
        this.timestamp = timestamp;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public MissionEntity getMissionEntity() {
        return missionEntity;
    }

    public void setMissionEntity(MissionEntity missionEntity) {
        this.missionEntity = missionEntity;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Double getAltitude() {
        return altitude;
    }

    public void setAltitude(Double altitude) {
        this.altitude = altitude;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Double getSurvivorProbability() {
        return survivorProbability;
    }

    public void setSurvivorProbability(Double survivorProbability) {
        this.survivorProbability = survivorProbability;
    }

    public Boolean getStructuralGapFound() {
        return structuralGapFound;
    }

    public void setStructuralGapFound(Boolean structuralGapFound) {
        this.structuralGapFound = structuralGapFound;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
