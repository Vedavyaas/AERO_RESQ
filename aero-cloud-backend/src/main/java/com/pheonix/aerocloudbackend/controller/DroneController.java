package com.pheonix.aerocloudbackend.controller;

import com.pheonix.aerocloudbackend.assets.DroneDTO;
import com.pheonix.aerocloudbackend.assets.DroneDetails;
import com.pheonix.aerocloudbackend.assets.DroneStatus;
import com.pheonix.aerocloudbackend.service.DroneService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/drone")
public class DroneController {

    private final DroneService droneService;

    public DroneController(DroneService droneService) {
        this.droneService = droneService;
    }

    @Secured("SCOPE_ROLE_USER")
    @PostMapping
    public ResponseEntity<String> createDrone(@RequestBody DroneDetails request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(droneService.createDrone(request, username));
    }

    @Secured("SCOPE_ROLE_USER")
    @GetMapping
    public ResponseEntity<Page<DroneDTO>> getMyDrones(@RequestParam Integer start, @RequestParam Integer size) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(droneService.getDrones(start, size, username));
    }

    @Secured("SCOPE_ROLE_USER")
    @PatchMapping
    public ResponseEntity<String> toggleStatus(@RequestParam Long id, @RequestParam DroneStatus status, @AuthenticationPrincipal Jwt jwt) {
        if (status.equals(DroneStatus.BOOT) || status.equals(DroneStatus.READY)) {
            return ResponseEntity.ok(droneService.toggleStatus(id, status, jwt.getSubject()));
        }
        return ResponseEntity.ok("Sorry option is not available!");
    }
}
