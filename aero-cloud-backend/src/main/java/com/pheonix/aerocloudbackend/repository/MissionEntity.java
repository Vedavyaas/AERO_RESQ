package com.pheonix.aerocloudbackend.repository;

import com.pheonix.aerocloudbackend.assets.MissionStatus;
import com.pheonix.aerocloudbackend.assets.RiskStatus;
import jakarta.persistence.*;

@Entity
public class MissionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String missionName;

    @ManyToOne
    @JoinColumn(name = "drone_entity_id")
    private DroneEntity droneEntity;

    private String latitude;
    private String longitude;
    private String altitude;

    @Enumerated(value = EnumType.STRING)
    private RiskStatus risk;

    @Enumerated(value = EnumType.STRING)
    private MissionStatus missionStatus;

    @ManyToOne
    @JoinColumn(name = "owner_entity_id")
    private UserEntity owner;

    public MissionEntity() {
    }

    public MissionEntity(String missionName, DroneEntity droneEntity, String latitude, String longitude, String altitude, RiskStatus risk, MissionStatus missionStatus, UserEntity owner) {
        this.missionName = missionName;
        this.droneEntity = droneEntity;
        this.latitude = latitude;
        this.longitude = longitude;
        this.altitude = altitude;
        this.risk = risk;
        this.missionStatus = missionStatus;
        this.owner = owner;
    }

    public DroneEntity getDroneEntity() {
        return droneEntity;
    }

    public void setDroneEntity(DroneEntity droneEntity) {
        this.droneEntity = droneEntity;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public String getMissionName() {
        return missionName;
    }

    public void setMissionName(String missionName) {
        this.missionName = missionName;
    }

    public String getLatitude() {
        return latitude;
    }

    public void setLatitude(String latitude) {
        this.latitude = latitude;
    }

    public String getLongitude() {
        return longitude;
    }

    public void setLongitude(String longitude) {
        this.longitude = longitude;
    }

    public String getAltitude() {
        return altitude;
    }

    public void setAltitude(String altitude) {
        this.altitude = altitude;
    }

    public RiskStatus getRisk() {
        return risk;
    }

    public void setRisk(RiskStatus risk) {
        this.risk = risk;
    }

    public MissionStatus getMissionStatus() {
        return missionStatus;
    }

    public void setMissionStatus(MissionStatus missionStatus) {
        this.missionStatus = missionStatus;
    }

    public UserEntity getOwner() {
        return owner;
    }

    public void setOwner(UserEntity owner) {
        this.owner = owner;
    }
}
