package com.pheonix.aerocloudbackend.service;

import com.pheonix.aerocloudbackend.assets.*;
import com.pheonix.aerocloudbackend.repository.UserEntity;
import com.pheonix.aerocloudbackend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtEncoder jwtEncoder;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, AuthenticationManager authenticationManager, JwtEncoder jwtEncoder, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
        this.jwtEncoder = jwtEncoder;
        this.passwordEncoder = passwordEncoder;
    }

    public UserDTO getInfo(String username) {
        Optional<UserEntity> user = userRepository.findByUsername(username);

        if (user.isEmpty()) {
            throw new InvalidConfig("Failed to fetch data. Retry!");
        }

        return new UserDTO(user.get().getId(), user.get().getUsername(), user.get().getRole(), user.get().isEnabled());
    }


    public JWTToken authenticate(LoginCredentials loginCredentials) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginCredentials.username(), loginCredentials.password())
            );
        } catch (DisabledException e) {
            throw new InvalidConfig("Your account has been disabled. Please contact an administrator.");
        }

        Instant now = Instant.now();
        String scope = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(" "));

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("self")
                .issuedAt(now)
                .expiresAt(now.plus(10, ChronoUnit.HOURS))
                .subject(authentication.getName())
                .claim("scope", scope)
                .build();

        String token = this.jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
        return new JWTToken(token);
    }

    public String createUser(UserCreationDetails userCreationDetails) {
        if (userRepository.existsByUsername(userCreationDetails.username())) {
            throw new InvalidConfig("Username already exists.");
        }
        UserEntity user = new UserEntity(userCreationDetails.username(), passwordEncoder.encode(userCreationDetails.password()), userCreationDetails.role());
        userRepository.save(user);

        return "User created successfully";
    }

    public Page<UserDTO> getBatchUsers(Integer start, Integer size) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        Pageable pageable = PageRequest.of(start, size);
        Page<UserEntity> page = userRepository.findByUsernameNot(currentUsername, pageable);

        return page.map(i -> new UserDTO(i.getId(), i.getUsername(), i.getRole(), i.isEnabled()));
    }


    public String toggleEnabled(Long id) {
        Optional<UserEntity> user = userRepository.findById(id);
        if (user.isEmpty()) {
            throw new InvalidConfig("User doesnt exist!");
        }

        user.get().setEnabled(!user.get().isEnabled());
        userRepository.save(user.get());

        return "Toggle successful.";
    }
}
