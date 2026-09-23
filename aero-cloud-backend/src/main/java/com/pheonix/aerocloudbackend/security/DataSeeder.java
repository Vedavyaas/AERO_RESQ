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
        // Clear existing data to allow re-seeding with new data
        statisticRepository.deleteAll();
        missionRepository.deleteAll();
        droneRepository.deleteAll();
        userRepository.deleteAll();

        UserEntity userEntity = new UserEntity("admin", passwordEncoder.encode("123"), Role.ADMIN);
        UserEntity userEntity1 = new UserEntity("user", passwordEncoder.encode("123"), Role.USER);
        userRepository.save(userEntity);
        userRepository.save(userEntity1);

        DroneEntity drone1 = new DroneEntity("DRN-X100", "DJI Inspire 3", userEntity1);
        DroneEntity drone2 = new DroneEntity("DRN-Mavic", "DJI Mavic 3 Enterprise", userEntity1);
        DroneEntity drone3 = new DroneEntity("DRN-Matrice", "DJI Matrice 300 RTK", userEntity1);
        droneRepository.saveAll(List.of(drone1, drone2, drone3));
        DroneEntity[] drones = {drone1, drone2, drone3};

        Random random = new Random();
        List<StatisticEntity> stats = new ArrayList<>();

        // Create multiple missions to test with
        String[][] missionData = {
            {"Operation Gamma", "11.0168", "76.9558"},
            {"Operation Alpha", "34.0522", "-118.2437"}, // LA
            {"Operation Beta", "40.7128", "-74.0060"}    // NY
        };

        for (int mIndex = 0; mIndex < missionData.length; mIndex++) {
            String[] mData = missionData[mIndex];
            String name = mData[0];
            double baseLat = Double.parseDouble(mData[1]);
            double baseLng = Double.parseDouble(mData[2]);

            MissionEntity mission = new MissionEntity(
                    name, drones[mIndex], String.valueOf(baseLat), String.valueOf(baseLng), "120.0", RiskStatus.HIGH, MissionStatus.IN_PROGRESS, userEntity1
            );
            missionRepository.save(mission);

            // Organic, natural-looking structure generation using Gaussian distribution
            double[][] clusters = {
                {0.002, -0.002, 0.001, 0}, // Cluster A (Block)
                {0.0025, 0.002, 0.0008, 1}, // Cluster B (Gap - high survivor)
                {-0.003, 0.001, 0.0012, 0}, // Cluster C (Block)
                {-0.001, -0.001, 0.0005, 0}, // Cluster D (small dense debris)
                {0.000, 0.003, 0.001, 1}, // Cluster E (Gap - east)
                {-0.002, -0.003, 0.0015, 1}, // Cluster F (Gap - southwest, wide spread)
                {0.004, 0.000, 0.0007, 0}, // Cluster G (Block - north)
                {-0.004, 0.002, 0.0009, 1}, // Cluster H (Gap - south east)
                {0.001, 0.001, 0.0004, 0}, // Cluster I (Small block near center)
                {-0.002, 0.003, 0.0011, 0} // Cluster J (Block)
            };
            
            for (double[] cluster : clusters) {
                double cLat = baseLat + cluster[0];
                double cLng = baseLng + cluster[1];
                double spread = cluster[2];
                boolean hasGap = cluster[3] > 0;
                
                // Generate 120 points per cluster for a solid density
                for (int i = 0; i < 120; i++) {
                    double lat = cLat + (random.nextGaussian() * spread);
                    double lng = cLng + (random.nextGaussian() * spread);
                    
                    boolean isGap = false;
                    double temp = 25.0 + random.nextDouble() * 3;
                    double prob = random.nextDouble() * 0.15;
                    
                    if (hasGap && i < 15) { // The first 15 points of this cluster are the high-heat gap
                        isGap = true;
                        lat = cLat + (random.nextGaussian() * (spread * 0.2)); 
                        lng = cLng + (random.nextGaussian() * (spread * 0.2));
                        
                        temp = 60.0 + random.nextDouble() * 15; // 60-75 temp
                        prob = 0.85 + random.nextDouble() * 0.15; // High prob
                    }
                    
                    StatisticEntity stat = new StatisticEntity(
                            mission,
                            lat,
                            lng,
                            120.0 + (random.nextGaussian() * 5),
                            temp,
                            prob,
                            isGap,
                            LocalDateTime.now().minusMinutes(random.nextInt(60))
                    );
                    stats.add(stat);
                }
            }
        }
        statisticRepository.saveAll(stats);

    }
}
