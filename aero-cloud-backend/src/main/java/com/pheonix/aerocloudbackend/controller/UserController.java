package com.pheonix.aerocloudbackend.controller;

import com.pheonix.aerocloudbackend.assets.*;
import com.pheonix.aerocloudbackend.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<UserDTO> getInfo(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userService.getInfo(jwt.getSubject()));
    }

    @Secured("SCOPE_ROLE_ADMIN")
    @PostMapping
    public ResponseEntity<String> createUser(@RequestBody UserCreationDetails userCreationDetails) {
        return ResponseEntity.ok(userService.createUser(userCreationDetails));
    }

    @Secured("SCOPE_ROLE_ADMIN")
    @GetMapping("/all")
    public ResponseEntity<Page<UserDTO>> getBatch(@RequestParam Integer start, @RequestParam Integer size) {
        return ResponseEntity.ok(userService.getBatchUsers(start, size));
    }

    @Secured("SCOPE_ROLE_ADMIN")
    @PatchMapping("/{id}")
    public ResponseEntity<String> toggleEnabled(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleEnabled(id));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<JWTToken> authenticate(@RequestBody LoginCredentials loginCredentials) {
        return ResponseEntity.ok(userService.authenticate(loginCredentials));
    }
}
