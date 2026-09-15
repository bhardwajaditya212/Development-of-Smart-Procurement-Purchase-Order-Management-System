package com.aditya.enterpriseprocurementsystem.service;

import com.aditya.enterpriseprocurementsystem.dto.AdminLoginResponse;
import com.aditya.enterpriseprocurementsystem.dto.AdminRegistrationResponse;
import com.aditya.enterpriseprocurementsystem.entity.Admin;
import com.aditya.enterpriseprocurementsystem.entity.Department;
import com.aditya.enterpriseprocurementsystem.repository.AdminRepository;
import com.aditya.enterpriseprocurementsystem.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    // ============================
    // Admin Registration
    // ============================
    public AdminRegistrationResponse registerAdmin(Admin admin) {

        AdminRegistrationResponse response = new AdminRegistrationResponse();

        // Check Email Already Exists
        Optional<Admin> existingAdmin =
                adminRepository.findByEmail(admin.getEmail());

        if (existingAdmin.isPresent()) {

            response.setMessage("Email Already Registered");
            return response;
        }

        // Check Department Exists
        Integer departmentId = admin.getDepartment().getDepartmentId();

        Optional<Department> department =
                departmentRepository.findById(departmentId);

        if (department.isEmpty()) {

            response.setMessage("Department Not Found");
            return response;
        }

        // Set Department
        admin.setDepartment(department.get());

        // Save Admin
        Admin savedAdmin = adminRepository.save(admin);

        // Prepare Response
        response.setMessage("Admin Registered Successfully");
        response.setAdminId(savedAdmin.getAdminId());
        response.setName(savedAdmin.getName());
        response.setEmail(savedAdmin.getEmail());
        response.setDepartment(
                savedAdmin.getDepartment().getDepartmentName()
        );

        return response;
    }

    // ============================
    // Admin Login
    // ============================
    public AdminLoginResponse loginAdmin(String email, String password) {

        AdminLoginResponse response = new AdminLoginResponse();

        Optional<Admin> admin =
                adminRepository.findByEmailAndPassword(email, password);

        if (admin.isPresent()) {

            Admin loggedInAdmin = admin.get();

            response.setMessage("Admin Login Successful");
            response.setAdminId(loggedInAdmin.getAdminId());
            response.setName(loggedInAdmin.getName());
            response.setEmail(loggedInAdmin.getEmail());
            response.setDepartment(
                    loggedInAdmin.getDepartment().getDepartmentName()
            );

            return response;
        }

        response.setMessage("Invalid Email or Password");

        return response;
    }

}