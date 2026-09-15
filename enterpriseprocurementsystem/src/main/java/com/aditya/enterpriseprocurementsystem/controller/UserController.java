package com.aditya.enterpriseprocurementsystem.controller;

import com.aditya.enterpriseprocurementsystem.dto.LoginRequest;
import com.aditya.enterpriseprocurementsystem.dto.LoginResponse;
import com.aditya.enterpriseprocurementsystem.dto.RegistrationResponse;
import com.aditya.enterpriseprocurementsystem.entity.User;
import com.aditya.enterpriseprocurementsystem.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    // ============================
    // User Registration
    // ============================
    @PostMapping("/register")
    public RegistrationResponse registerUser(@Valid @RequestBody User user) {

        return userService.registerUser(user);
    }

    // ============================
    // User Login
    // ============================
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> loginUser(
            @RequestBody LoginRequest loginRequest) {

        LoginResponse response = userService.loginUser(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        );

        if ("Login Successful".equals(response.getMessage())) {
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(401).body(response);
    }
}