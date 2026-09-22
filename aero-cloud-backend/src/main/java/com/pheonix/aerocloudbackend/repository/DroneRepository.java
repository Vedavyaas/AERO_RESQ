package com.pheonix.aerocloudbackend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DroneRepository extends JpaRepository<DroneEntity, Long> {
    Optional<DroneEntity> findByDroneCode(String droneCode);
    Page<DroneEntity> findByOwner(UserEntity owner, Pageable pageable);

    Optional<DroneEntity> findByIdAndOwner(Long id, UserEntity owner);
}