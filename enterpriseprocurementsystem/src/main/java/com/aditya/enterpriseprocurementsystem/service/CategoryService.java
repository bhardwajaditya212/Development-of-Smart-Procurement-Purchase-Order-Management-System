package com.aditya.enterpriseprocurementsystem.service;

import com.aditya.enterpriseprocurementsystem.entity.Category;
import com.aditya.enterpriseprocurementsystem.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Category> getCategoryByDepartmentId(Integer departmentId) {
        return categoryRepository.findByDepartmentDepartmentId(departmentId);
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
}
