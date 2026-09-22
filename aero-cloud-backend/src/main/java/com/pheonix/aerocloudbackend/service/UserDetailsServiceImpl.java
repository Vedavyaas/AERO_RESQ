package com.pheonix.aerocloudbackend.service;

import com.pheonix.aerocloudbackend.repository.UserEntity;
import com.pheonix.aerocloudbackend.repository.UserRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<UserEntity> userEntity = userRepository.findByUsername(username);
        if (userEntity.isEmpty()) {
            throw new UsernameNotFoundException("Username not found.");
        }

        return User
                .withUsername(username)
                .password(userEntity.get().getPassword())
                .roles(userEntity.get().getRole().toString())
                .disabled(!userEntity.get().isEnabled())
                .build();
    }
}
