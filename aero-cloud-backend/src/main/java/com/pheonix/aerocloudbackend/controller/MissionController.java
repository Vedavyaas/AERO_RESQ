package com.pheonix.aerocloudbackend.controller;

import com.pheonix.aerocloudbackend.assets.MissionDTO;
import com.pheonix.aerocloudbackend.assets.MissionDetails;
import com.pheonix.aerocloudbackend.service.MissionService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mission")
public class MissionController {
    private final MissionService missionService;

    public MissionController(MissionService missionService) {
        this.missionService = missionService;
    }

    @Secured("SCOPE_ROLE_USER")
    @PostMapping
    public ResponseEntity<String> createMission(@RequestBody MissionDetails missionDetails, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(missionService.createMission(missionDetails, jwt.getSubject()));
    }

    @Secured("SCOPE_ROLE_USER")
    @GetMapping
    public ResponseEntity<Page<MissionDTO>> getMission(@RequestParam Integer start, @RequestParam Integer size, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(missionService.getMissions(start, size, jwt.getSubject()));
    }
}
