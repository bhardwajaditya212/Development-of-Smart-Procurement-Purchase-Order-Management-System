package com.aditya.enterpriseprocurementsystem.service;

import com.aditya.enterpriseprocurementsystem.entity.Product;
import com.aditya.enterpriseprocurementsystem.repository.ProductRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    // =====================================================
    // GET ALL PRODUCTS
    // =====================================================

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // =====================================================
    // UPDATE PRODUCT STATUS
    // =====================================================

    public Product updateProductStatus(
            Integer productId,
            String status
    ) {

        // Find Product
        Optional<Product> productOptional =
                productRepository.findById(productId);

        // Product Not Found
        if (productOptional.isEmpty()) {

            throw new RuntimeException(
                    "Product Not Found"
            );
        }

        Product product =
                productOptional.get();

        // Validate Status
        if (status == null || status.isBlank()) {

            throw new RuntimeException(
                    "Product Status is required"
            );
        }

        // Update Status
        product.setStatus(
                status.toUpperCase()
        );

        // Update Date
        product.setUpdateDate(
                LocalDateTime.now()
        );

        // Save Product
        return productRepository.save(product);
    }
}