package com.aditya.enterpriseprocurementsystem.repository;

import com.aditya.enterpriseprocurementsystem.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Integer> {

    List<Category> findByDepartmentDepartmentId(Integer departmentId);

}
