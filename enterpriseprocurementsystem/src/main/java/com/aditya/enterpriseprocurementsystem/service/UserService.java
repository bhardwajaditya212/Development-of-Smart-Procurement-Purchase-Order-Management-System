package com.aditya.enterpriseprocurementsystem.service;

import com.aditya.enterpriseprocurementsystem.dto.LoginResponse;
import com.aditya.enterpriseprocurementsystem.dto.RegistrationResponse;
import com.aditya.enterpriseprocurementsystem.entity.Department;
import com.aditya.enterpriseprocurementsystem.entity.User;
import com.aditya.enterpriseprocurementsystem.repository.DepartmentRepository;
import com.aditya.enterpriseprocurementsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    // ============================
    // User Registration
    // ============================
    public RegistrationResponse registerUser(User user) {

        RegistrationResponse response = new RegistrationResponse();

        // Check if email already exists
        Optional<User> existingUser =
                userRepository.findByEmail(user.getEmail());

        if (existingUser.isPresent()) {
            response.setMessage("Email Already Registered");
            return response;
        }

        // Check if department exists
        Integer departmentId = user.getDepartment().getDepartmentId();

        Optional<Department> department =
                departmentRepository.findById(departmentId);

        if (department.isEmpty()) {
            response.setMessage("Department Not Found");
            return response;
        }

        // Set Department
        user.setDepartment(department.get());

        // Save User
        User savedUser = userRepository.save(user);

        // Prepare Response
        response.setMessage("User Registered Successfully");
        response.setUserId(savedUser.getUserId());
        response.setName(savedUser.getName());
        response.setEmail(savedUser.getEmail());
        response.setDesignation(savedUser.getDesignation());
        response.setDepartment(
                savedUser.getDepartment().getDepartmentName()
        );

        return response;
    }

    // ============================
    // User Login
    // ============================
    public LoginResponse loginUser(String email, String password) {

        Optional<User> user =
                userRepository.findByEmailAndPassword(email, password);

        LoginResponse response = new LoginResponse();

        if (user.isPresent()) {

            User loggedInUser = user.get();

            response.setMessage("Login Successful");
            response.setUserId(loggedInUser.getUserId());
            response.setName(loggedInUser.getName());
            response.setEmail(loggedInUser.getEmail());
            response.setDesignation(loggedInUser.getDesignation());
            response.setDepartment(
                    loggedInUser.getDepartment().getDepartmentName()
            );

            return response;
        }

        response.setMessage("Invalid Email or Password");

        return response;
    }
}