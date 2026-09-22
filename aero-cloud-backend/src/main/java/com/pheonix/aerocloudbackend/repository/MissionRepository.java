package com.pheonix.aerocloudbackend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MissionRepository extends JpaRepository<MissionEntity, Long> {
    Page<MissionEntity> findByOwner_Username(String ownerUsername, Pageable pageable);
}
