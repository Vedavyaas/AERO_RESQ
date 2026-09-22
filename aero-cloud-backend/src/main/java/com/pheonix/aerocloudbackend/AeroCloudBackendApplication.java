package com.pheonix.aerocloudbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AeroCloudBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(AeroCloudBackendApplication.class, args);
    }

}
