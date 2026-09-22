package com.pheonix.aerocloudbackend.security;

import com.pheonix.aerocloudbackend.assets.Role;
import com.pheonix.aerocloudbackend.repository.UserEntity;
import com.pheonix.aerocloudbackend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.pheonix.aerocloudbackend.assets.DroneStatus;
import com.pheonix.aerocloudbackend.assets.MissionStatus;
import com.pheonix.aerocloudbackend.assets.RiskStatus;
import com.pheonix.aerocloudbackend.repository.DroneEntity;
import com.pheonix.aerocloudbackend.repository.DroneRepository;
import com.pheonix.aerocloudbackend.repository.MissionEntity;
import com.pheonix.aerocloudbackend.repository.MissionRepository;
import com.pheonix.aerocloudbackend.repository.StatisticEntity;
import com.pheonix.aerocloudbackend.repository.StatisticRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
public class DataSeeder implements CommandLineRunner {
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final DroneRepository droneRepository;
    private final MissionRepository missionRepository;
    private final StatisticRepository statisticRepository;

    public DataSeeder(PasswordEncoder passwordEncoder, UserRepository userRepository, DroneRepository droneRepository, MissionRepository missionRepository, StatisticRepository statisticRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.droneRepository = droneRepository;
        this.missionRepository = missionRepository;
        this.statisticRepository = statisticRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) return; // Prevent duplicate seeding

        UserEntity userEntity = new UserEntity("admin", passwordEncoder.encode("123"), Role.ADMIN);
        UserEntity userEntity1 = new UserEntity("user", passwordEncoder.encode("123"), Role.USER);
        userRepository.save(userEntity);
        userRepository.save(userEntity1);

        DroneEntity drone = new DroneEntity("DRN-X100", "DJI Inspire 3", userEntity1);
        droneRepository.save(drone);

        MissionEntity mission = new MissionEntity(
                "Operation Gamma", drone, "11.0168", "76.9558", "120.0", RiskStatus.HIGH, MissionStatus.IN_PROGRESS, userEntity1
        );
        missionRepository.save(mission);

        Random random = new Random();
        List<StatisticEntity> stats = new ArrayList<>();
        double baseLat = 11.0168;
        double baseLng = 76.9558;

        for (int i = 0; i < 500; i++) {
            // Generate points in a ~1km radius roughly
            double latOffset = (random.nextDouble() - 0.5) * 0.01;
            double lngOffset = (random.nextDouble() - 0.5) * 0.01;
            
            // Create some clusters of high probability / temp
            double distFromCenter = Math.sqrt(Math.pow(latOffset, 2) + Math.pow(lngOffset, 2));
            double survivorProb = Math.max(0, 1.0 - (distFromCenter * 150)); 
            if (random.nextDouble() > 0.9) survivorProb = 0.9; // Random noise

            double temp = 25.0 + (survivorProb * 15) + (random.nextDouble() * 5);
            boolean gap = survivorProb > 0.8 && random.nextDouble() > 0.7;

            StatisticEntity stat = new StatisticEntity(
                    mission,
                    baseLat + latOffset,
                    baseLng + lngOffset,
                    120.0 + (random.nextDouble() * 10),
                    temp,
                    survivorProb,
                    gap,
                    LocalDateTime.now().minusMinutes(random.nextInt(60))
            );
            stats.add(stat);
        }
        statisticRepository.saveAll(stats);
    }
}
