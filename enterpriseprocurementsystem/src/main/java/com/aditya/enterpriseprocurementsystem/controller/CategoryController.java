package com.aditya.enterpriseprocurementsystem.controller;

import com.aditya.enterpriseprocurementsystem.entity.Category;
import com.aditya.enterpriseprocurementsystem.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/category")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public List<Category> getAllCategories() {
        return categoryService.getAllCategories();
    }

    @GetMapping("/department/{departmentId}")
    public List<Category> getCategoryByDepartmentId(@PathVariable Integer departmentId) {

        return categoryService.getCategoryByDepartmentId(departmentId);

    }
}
