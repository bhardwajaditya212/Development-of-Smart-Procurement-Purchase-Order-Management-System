package com.aditya.enterpriseprocurementsystem.controller;

import com.aditya.enterpriseprocurementsystem.dto.AdminLoginRequest;
import com.aditya.enterpriseprocurementsystem.dto.AdminLoginResponse;
import com.aditya.enterpriseprocurementsystem.dto.AdminRegistrationResponse;
import com.aditya.enterpriseprocurementsystem.entity.Admin;
import com.aditya.enterpriseprocurementsystem.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // ============================
    // Admin Registration
    // ============================
    @PostMapping("/register")
    public AdminRegistrationResponse registerAdmin(
            @Valid @RequestBody Admin admin) {

        return adminService.registerAdmin(admin);

    }

    // ============================
    // Admin Login
    // ============================
    @PostMapping("/login")
    public AdminLoginResponse loginAdmin(
            @RequestBody AdminLoginRequest loginRequest) {

        return adminService.loginAdmin(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        );

    }

}