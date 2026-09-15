package com.aditya.enterpriseprocurementsystem.dto;

import java.time.LocalDateTime;

public class ProductResponse {

    private Integer productId;
    private String name;
    private Double pricePerProduct;
    private Integer numberOfQuantities;
    private String status;
    private LocalDateTime updateDate;


    // =========================
    // GETTERS
    // =========================

    public Integer getProductId() {
        return productId;
    }

    public String getName() {
        return name;
    }

    public Double getPricePerProduct() {
        return pricePerProduct;
    }

    public Integer getNumberOfQuantities() {
        return numberOfQuantities;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getUpdateDate() {
        return updateDate;
    }


    // =========================
    // SETTERS
    // =========================

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPricePerProduct(Double pricePerProduct) {
        this.pricePerProduct = pricePerProduct;
    }

    public void setNumberOfQuantities(Integer numberOfQuantities) {
        this.numberOfQuantities = numberOfQuantities;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setUpdateDate(LocalDateTime updateDate) {
        this.updateDate = updateDate;
    }
}