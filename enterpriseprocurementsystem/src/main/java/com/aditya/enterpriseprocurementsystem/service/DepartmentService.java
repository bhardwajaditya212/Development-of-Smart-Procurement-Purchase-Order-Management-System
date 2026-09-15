package com.aditya.enterpriseprocurementsystem.service;

import com.aditya.enterpriseprocurementsystem.entity.Department;
import com.aditya.enterpriseprocurementsystem.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    // Get All Departments this is used to call service repository
    public List<Department> getAllDepartment() {
        return departmentRepository.findAll();
    }

    // Get Department By Id
    public Department getDepartmentByDepartmentId(Integer departmentId) {
        Optional<Department> department =
                departmentRepository.findById(departmentId);

        return department.orElse(null);
    }

}
