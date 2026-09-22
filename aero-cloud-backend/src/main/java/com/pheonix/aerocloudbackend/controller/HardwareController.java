package com.pheonix.aerocloudbackend.controller;

import com.pheonix.aerocloudbackend.assets.Statistics;
import com.pheonix.aerocloudbackend.service.DroneCoordinatorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hardware")
public class HardwareController {

    private final DroneCoordinatorService droneCoordinatorService;

    public HardwareController(DroneCoordinatorService droneCoordinatorService) {
        this.droneCoordinatorService = droneCoordinatorService;
    }

    @PostMapping("/telemetry")
    public ResponseEntity<String> postStats(@RequestBody java.util.List<Statistics> statisticsList) {
        for (Statistics statistics : statisticsList) {
            droneCoordinatorService.setStats(statistics);
        }
        return ResponseEntity.ok("success");
    }

    @PostMapping("/telemetry/single")
    public ResponseEntity<String> postStatsSingle(@RequestBody Statistics statistics) {
        return ResponseEntity.ok(droneCoordinatorService.setStats(statistics));
    }

    @PostMapping
    public ResponseEntity<String> droneReturningNotification(@RequestParam String droneCode) {
        return ResponseEntity.ok(droneCoordinatorService.droneReturning(droneCode));
    }

    @PatchMapping
    public ResponseEntity<String> droneReachedNotification(@RequestParam String droneCode) {
        return ResponseEntity.ok(droneCoordinatorService.droneReturned(droneCode));
    }
}
