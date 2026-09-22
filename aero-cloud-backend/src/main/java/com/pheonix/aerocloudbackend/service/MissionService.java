package com.pheonix.aerocloudbackend.service;

import com.pheonix.aerocloudbackend.assets.*;
import com.pheonix.aerocloudbackend.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class MissionService {
    private final UserRepository userRepository;
    private final DroneRepository droneRepository;
    private final MissionRepository missionRepository;

    public MissionService(UserRepository userRepository, DroneRepository droneRepository, MissionRepository missionRepository) {
        this.userRepository = userRepository;
        this.droneRepository = droneRepository;
        this.missionRepository = missionRepository;
    }

    @Transactional
    public String createMission(MissionDetails missionDetails, String username) {
        Optional<UserEntity> userEntity = userRepository.findByUsername(username);

        if (userEntity.isEmpty()) {
            throw new InvalidConfig("Some error occurred. Please try again.");
        }

        Optional<DroneEntity> droneEntity = droneRepository.findByIdAndOwner(missionDetails.droneId(), userEntity.get());

        if (droneEntity.isEmpty()) {
            throw new InvalidConfig("Drone not found. Please try again.");
        }

        if (droneEntity.get().getDroneStatus().equals(DroneStatus.BOOT)) {
            throw new InvalidConfig("Drone is in boot. Try with another drone.");
        }

        if (droneEntity.get().getDroneStatus().equals(DroneStatus.RETURNING)) {
            throw new InvalidConfig("Drone is returning from mission. Try with another drone.");
        }

        if (droneEntity.get().getDroneStatus().equals(DroneStatus.IN_MISSION)) {
            throw new InvalidConfig("Drone is in mission. Try with another drone.");
        }

        MissionEntity missionEntity =
                new MissionEntity(missionDetails.missionName(),
                        droneEntity.get(),
                        missionDetails.latitude(),
                        missionDetails.longitude(),
                        missionDetails.altitude(),
                        missionDetails.riskStatus(),
                        MissionStatus.STARTED,
                        userEntity.get());

        droneEntity.get().setDroneStatus(DroneStatus.IN_MISSION);
        droneRepository.save(droneEntity.get());
        missionRepository.save(missionEntity);
        return "Mission started successfully.";
    }

    public Page<MissionDTO> getMissions(Integer start, Integer size, String username) {
        Optional<UserEntity> userEntity = userRepository.findByUsername(username);

        if (userEntity.isEmpty()) {
            throw new InvalidConfig("Some error occurred. Please try again.");
        }

        Pageable pageable = PageRequest.of(start, size);
        Page<MissionEntity> missionEntities = missionRepository.findByOwner_Username(username, pageable);

        return missionEntities.map(i -> new MissionDTO(i.getId(), i.getMissionName(), i.getDroneEntity().getDroneCode(), i.getLatitude(), i.getLongitude(), i.getAltitude(), i.getRisk(), i.getMissionStatus()));
    }
}
