package com.pheonix.aerocloudbackend.service;

import com.pheonix.aerocloudbackend.assets.DroneStatus;
import com.pheonix.aerocloudbackend.assets.InvalidConfig;
import com.pheonix.aerocloudbackend.assets.MissionStatus;
import com.pheonix.aerocloudbackend.assets.Statistics;
import com.pheonix.aerocloudbackend.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

@Service
public class DroneCoordinatorService {
    @Value("${ip}")
    private static String ip;
    private static final String uri = "http://"+ ip +":5000/initiate";
    private final MissionRepository missionRepository;
    private final DroneRepository droneRepository;
    private final StatisticRepository statisticRepository;

    public DroneCoordinatorService(MissionRepository missionRepository, DroneRepository droneRepository, StatisticRepository statisticRepository) {
        this.missionRepository = missionRepository;
        this.droneRepository = droneRepository;
        this.statisticRepository = statisticRepository;
    }

    @Scheduled(fixedDelay = 1_000)
    public void assignDrone() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<MissionEntity> missionEntities = missionRepository.findByMissionStatus(MissionStatus.STARTED, pageable);

        for (var mission : missionEntities) {
            RestTemplate restTemplate = new RestTemplate();
            
            String url = String.format("%s?latitude=%s&longitude=%s&altitude=%s",
                uri, 
                mission.getLatitude(), 
                mission.getLongitude(), 
                mission.getAltitude()
            );
            
            try {
                ResponseEntity<String> responseEntity = restTemplate.getForEntity(url, null, String.class);
                if (responseEntity.getStatusCode().is2xxSuccessful()) {
                    mission.setMissionStatus(MissionStatus.IN_PROGRESS);
                }
            } catch (Exception e) {
                // If the request fails, we leave the status as STARTED so it will be retried next time
                System.err.println("Failed to initiate mission " + mission.getId() + ": " + e.getMessage());
            }
        }

        missionRepository.saveAll(missionEntities);
    }

    public String setStats(Statistics statistics) {
        Optional<DroneEntity> droneEntity = droneRepository.findByDroneCode(statistics.droneCode());

        if (droneEntity.isEmpty()) {
            return "failed.";
        }

        Optional<MissionEntity> missionEntity = missionRepository.findByDroneEntity(droneEntity.get());

        if (missionEntity.isEmpty()) {
            return "failed.";
        }

        StatisticEntity statisticEntity = new StatisticEntity();
        statisticEntity.setMissionEntity(missionEntity.get());
        statisticEntity.setLatitude(statistics.latitude());
        statisticEntity.setLongitude(statistics.longitude());
        statisticEntity.setAltitude(statistics.altitude());
        statisticEntity.setTemperature(statistics.temperature());
        statisticEntity.setSurvivorProbability(statistics.survivorProbability());
        statisticEntity.setStructuralGapFound(statistics.structuralGapFound());
        
        java.time.LocalDateTime ts = java.time.LocalDateTime.now();
        if (statistics.timestamp() != null && !statistics.timestamp().isEmpty()) {
            try {
                ts = java.time.LocalDateTime.parse(statistics.timestamp());
            } catch (Exception e) {
                // ignore and use now()
            }
        }
        statisticEntity.setTimestamp(ts);

        statisticRepository.save(statisticEntity);

        return "success.";
    }

    @Transactional
    public String droneReturning(String droneCode) {
        Optional<DroneEntity> droneEntity = droneRepository.findByDroneCode(droneCode);

        if (droneEntity.isEmpty()) {
            throw new InvalidConfig("Drone not found!");
        }

        Optional<MissionEntity> missionEntity = missionRepository.findByDroneEntity(droneEntity.get());

        if (missionEntity.isEmpty()) {
            throw new InvalidConfig("Drone is not linked with mission!");
        }

        missionEntity.get().setMissionStatus(MissionStatus.COMPLETED);
        missionRepository.save(missionEntity.get());
        droneEntity.get().setDroneStatus(DroneStatus.RETURNING);
        droneRepository.save(droneEntity.get());

        return "Saved successfully.";
    }

    public String droneReturned(String droneCode) {
        Optional<DroneEntity> droneEntity = droneRepository.findByDroneCode(droneCode);

        if (droneEntity.isEmpty() || !droneEntity.get().getDroneStatus().equals(DroneStatus.RETURNING)) {
            throw new InvalidConfig("Drone not found!");
        }
        droneEntity.get().setDroneStatus(DroneStatus.READY);
        droneRepository.save(droneEntity.get());

        return "Drone reached.";
    }
}