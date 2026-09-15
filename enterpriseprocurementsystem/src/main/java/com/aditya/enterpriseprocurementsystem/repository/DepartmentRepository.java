package com.aditya.enterpriseprocurementsystem.repository;

import com.aditya.enterpriseprocurementsystem.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, Integer> {

}
