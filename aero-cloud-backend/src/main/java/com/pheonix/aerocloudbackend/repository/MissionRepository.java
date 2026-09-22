package com.pheonix.aerocloudbackend.repository;

import com.pheonix.aerocloudbackend.assets.MissionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MissionRepository extends JpaRepository<MissionEntity, Long> {
    Page<MissionEntity> findByOwner_Username(String ownerUsername, Pageable pageable);

    Page<MissionEntity> findByMissionStatus(MissionStatus missionStatus, Pageable pageable);

    Optional<MissionEntity> findByDroneEntity(DroneEntity droneEntity);
}
