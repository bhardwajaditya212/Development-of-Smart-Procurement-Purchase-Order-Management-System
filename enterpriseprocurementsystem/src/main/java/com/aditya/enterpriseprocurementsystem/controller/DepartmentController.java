package com.aditya.enterpriseprocurementsystem.controller;

import com.aditya.enterpriseprocurementsystem.entity.Department;
import com.aditya.enterpriseprocurementsystem.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/department")
public class DepartmentController {

    @Autowired
    private DepartmentService departmentService;

    @GetMapping
    public List<Department> getAllDepartment() {

        return departmentService.getAllDepartment();

    }

    @GetMapping("/{departmentId}")
    public Department getDepartmentByDepartmentId(
            @PathVariable Integer departmentId) {

        return departmentService.getDepartmentByDepartmentId(departmentId);

    }

}
