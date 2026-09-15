package com.aditya.enterpriseprocurementsystem.repository;

import com.aditya.enterpriseprocurementsystem.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Integer> {

}
