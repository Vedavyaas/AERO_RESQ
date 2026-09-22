package com.pheonix.aerocloudbackend.repository;

import com.pheonix.aerocloudbackend.assets.DroneStatus;
import jakarta.persistence.*;

@Entity
public class DroneEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(unique = true)
    private String droneCode;
    private String model;

    @Enumerated(value = EnumType.STRING)
    private DroneStatus droneStatus;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private UserEntity owner;

    public DroneEntity() {
    }

    public DroneEntity(String droneCode, String model, UserEntity owner) {
        this.droneCode = droneCode;
        this.model = model;
        this.droneStatus = DroneStatus.READY;
        this.owner = owner;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public String getDroneCode() {
        return droneCode;
    }

    public void setDroneCode(String droneCode) {
        this.droneCode = droneCode;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public DroneStatus getDroneStatus() {
        return droneStatus;
    }

    public void setDroneStatus(DroneStatus droneStatus) {
        this.droneStatus = droneStatus;
    }

    public UserEntity getOwner() {
        return owner;
    }

    public void setOwner(UserEntity owner) {
        this.owner = owner;
    }
}
