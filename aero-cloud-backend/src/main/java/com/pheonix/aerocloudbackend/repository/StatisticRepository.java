package com.pheonix.aerocloudbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StatisticRepository extends JpaRepository<StatisticEntity, Long> {
    List<StatisticEntity> findByMissionEntity_Id(Long missionId);
}
