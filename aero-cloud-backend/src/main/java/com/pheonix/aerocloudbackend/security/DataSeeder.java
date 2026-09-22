package com.pheonix.aerocloudbackend.security;

import com.pheonix.aerocloudbackend.assets.Role;
import com.pheonix.aerocloudbackend.repository.UserEntity;
import com.pheonix.aerocloudbackend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    public DataSeeder(PasswordEncoder passwordEncoder, UserRepository userRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        UserEntity userEntity =
                new UserEntity("admin", passwordEncoder.encode("123"), Role.ADMIN);
        UserEntity userEntity1 =
                new UserEntity("user", passwordEncoder.encode("123"), Role.USER);

        userRepository.save(userEntity);
        userRepository.save(userEntity1);
    }
}
