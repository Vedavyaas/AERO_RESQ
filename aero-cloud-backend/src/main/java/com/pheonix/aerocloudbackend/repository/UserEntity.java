package com.pheonix.aerocloudbackend.repository;

import com.pheonix.aerocloudbackend.assets.Role;
import jakarta.persistence.*;

@Entity
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String username;
    private String password;

    @Enumerated(value = EnumType.STRING)
    private Role role;

    private boolean enabled;

    public UserEntity() {
    }

    public UserEntity(String username, String password, Role role) {
        this.username = username;
        this.password = password;
        this.role = role;
        this.enabled = true;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
