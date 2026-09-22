package com.pheonix.aerocloudbackend.service;

import com.pheonix.aerocloudbackend.assets.DroneDTO;
import com.pheonix.aerocloudbackend.assets.DroneDetails;
import com.pheonix.aerocloudbackend.assets.DroneStatus;
import com.pheonix.aerocloudbackend.assets.InvalidConfig;
import com.pheonix.aerocloudbackend.repository.DroneEntity;
import com.pheonix.aerocloudbackend.repository.DroneRepository;
import com.pheonix.aerocloudbackend.repository.UserEntity;
import com.pheonix.aerocloudbackend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class DroneService {
    private final DroneRepository droneRepository;
    private final UserRepository userRepository;

    public DroneService(DroneRepository droneRepository, UserRepository userRepository) {
        this.droneRepository = droneRepository;
        this.userRepository = userRepository;
    }

    public String createDrone(DroneDetails droneDetails, String username) {
        Optional<DroneEntity> droneEntity = droneRepository.findByDroneCode(droneDetails.droneCode());
        Optional<UserEntity> userEntity = userRepository.findByUsername(username);

        if (userEntity.isEmpty()) {
            throw new InvalidConfig("Some internal error. Please try again.");
        }

        if (droneEntity.isPresent()) {
            throw new InvalidConfig("Drone with code already exist!");
        }

        DroneEntity drone = new DroneEntity(droneDetails.droneCode(), droneDetails.model(), userEntity.get());
        droneRepository.save(drone);

        return "Drone created successfully.";
    }

    public Page<DroneDTO> getDrones(Integer start, Integer size, String username) {
        Optional<UserEntity> userEntity = userRepository.findByUsername(username);

        if (userEntity.isEmpty()) {
            throw new InvalidConfig("Some internal error. Please try again.");
        }

        Pageable pageable = PageRequest.of(start, size);
        Page<DroneEntity> droneEntities = droneRepository.findByOwner(userEntity.get(), pageable);

        return droneEntities.map(i -> new DroneDTO(i.getId(), i.getDroneCode(), i.getModel(), i.getDroneStatus()));
    }

    public String toggleStatus(Long id, DroneStatus status, String username) {
        Optional<UserEntity> userEntity = userRepository.findByUsername(username);

        if (userEntity.isEmpty()) {
            throw new InvalidConfig("Some internal error. Please try again.");
        }

        Optional<DroneEntity> droneEntity = droneRepository.findByIdAndOwner(id, userEntity.get());

        if (droneEntity.isEmpty()) {
            throw new InvalidConfig("Invalid drone selection.");
        }

        if (droneEntity.get().getDroneStatus().equals(DroneStatus.READY) || droneEntity.get().getDroneStatus().equals(DroneStatus.BOOT)) {
            droneEntity.get().setDroneStatus(status);
            droneRepository.save(droneEntity.get());

            return "Drone status changed successfully!";
        }

        return "Drone is in mission.";
    }
}
