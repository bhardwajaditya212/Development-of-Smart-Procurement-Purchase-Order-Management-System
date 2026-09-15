package com.aditya.enterpriseprocurementsystem.dto;

public class PendingRequestResponse {

    private Integer requestId;
    private String user;
    private String userEmail;
    private String product;
    private Integer productId;
    private String department;
    private Integer quantity;
    private Double pricePerProduct;
    private Double totalCost;
    private String status;
    private Integer currentApprovalLevel;
    private String paymentStatus;
    private String feedback;
    private String createdDate;

    public PendingRequestResponse() {
    }

    public Integer getRequestId() {
        return requestId;
    }

    public void setRequestId(Integer requestId) {
        this.requestId = requestId;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getProduct() {
        return product;
    }

    public void setProduct(String product) {
        this.product = product;
    }

    public String getProductName() {
        return product;
    }

    public void setProductName(String productName) {
        this.product = productName;
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getDepartmentName() {
        return department;
    }

    public void setDepartmentName(String departmentName) {
        this.department = departmentName;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getPricePerProduct() {
        return pricePerProduct;
    }

    public void setPricePerProduct(Double pricePerProduct) {
        this.pricePerProduct = pricePerProduct;
    }

    public Double getUnitPrice() {
        return pricePerProduct;
    }

    public void setUnitPrice(Double unitPrice) {
        this.pricePerProduct = unitPrice;
    }

    public Double getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(Double totalCost) {
        this.totalCost = totalCost;
    }

    public Double getEstimatedCost() {
        return totalCost;
    }

    public void setEstimatedCost(Double estimatedCost) {
        this.totalCost = estimatedCost;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getApprovalStatus() {
        return status;
    }

    public void setApprovalStatus(String approvalStatus) {
        this.status = approvalStatus;
    }

    public Integer getCurrentApprovalLevel() {
        return currentApprovalLevel;
    }

    public void setCurrentApprovalLevel(Integer currentApprovalLevel) {
        this.currentApprovalLevel = currentApprovalLevel;
    }

    public Integer getApprovalLevel() {
        return currentApprovalLevel;
    }

    public void setApprovalLevel(Integer approvalLevel) {
        this.currentApprovalLevel = approvalLevel;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    private String deliveryStatus;
    private String carrierName;
    private String trackingNumber;
    private String remarks;

    public String getDeliveryStatus() {
        return deliveryStatus;
    }

    public void setDeliveryStatus(String deliveryStatus) {
        this.deliveryStatus = deliveryStatus;
    }

    public String getCarrierName() {
        return carrierName;
    }

    public void setCarrierName(String carrierName) {
        this.carrierName = carrierName;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public String getAwbNumber() {
        return trackingNumber;
    }

    public void setAwbNumber(String awbNumber) {
        this.trackingNumber = awbNumber;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(String createdDate) {
        this.createdDate = createdDate;
    }
}
