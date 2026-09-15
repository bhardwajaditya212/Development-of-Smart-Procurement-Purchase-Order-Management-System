package com.aditya.enterpriseprocurementsystem.repository;

import com.aditya.enterpriseprocurementsystem.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Integer> {

    // Find by Email
    Optional<Admin> findByEmail(String email);

    // Login
    Optional<Admin> findByEmailAndPassword(String email, String password);

    // Find Admin by Department
    Optional<Admin> findByDepartment_DepartmentId(Integer departmentId);

}