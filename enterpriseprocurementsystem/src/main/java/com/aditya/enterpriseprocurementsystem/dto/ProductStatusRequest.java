package com.aditya.enterpriseprocurementsystem.dto;

public class ProductStatusRequest {

    private Integer productId;
    private String status;

    public ProductStatusRequest() {
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
