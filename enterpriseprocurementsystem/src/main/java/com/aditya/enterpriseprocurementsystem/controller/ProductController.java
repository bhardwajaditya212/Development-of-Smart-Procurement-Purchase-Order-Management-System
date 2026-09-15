package com.aditya.enterpriseprocurementsystem.controller;

import com.aditya.enterpriseprocurementsystem.dto.ProductResponse;
import com.aditya.enterpriseprocurementsystem.dto.ProductStatusRequest;
import com.aditya.enterpriseprocurementsystem.entity.Product;
import com.aditya.enterpriseprocurementsystem.service.ProductService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/product")
public class ProductController {

    @Autowired
    private ProductService productService;

    // ==========================================
    // GET ALL PRODUCTS
    // ==========================================

    @GetMapping
    public List<Product> getAllProducts() {

        return productService.getAllProducts();
    }

    // ==========================================
    // UPDATE PRODUCT STATUS
    // ==========================================

    @PutMapping("/{productId}/status")
    public ProductResponse updateProductStatus(
            @PathVariable Integer productId,
            @RequestBody ProductStatusRequest request
    ) {

        Product product = productService.updateProductStatus(
                productId,
                request.getStatus()
        );

        ProductResponse response = new ProductResponse();

        response.setProductId(product.getProductId());
        response.setName(product.getName());
        response.setPricePerProduct(product.getPricePerProduct());
        response.setNumberOfQuantities(product.getNumberOfQuantities());
        response.setStatus(product.getStatus());
        response.setUpdateDate(product.getUpdateDate());

        return response;
    }
}