package com.pheonix.aerocloudbackend.controller;

import com.pheonix.aerocloudbackend.assets.InvalidConfig;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionController {

    @ExceptionHandler(InvalidConfig.class)
    public ResponseEntity<String> handle(InvalidConfig ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}
