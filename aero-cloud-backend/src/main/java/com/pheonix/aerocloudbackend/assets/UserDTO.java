package com.pheonix.aerocloudbackend.assets;

public record UserDTO(Long id, String username, Role role, boolean enabled) {
}
