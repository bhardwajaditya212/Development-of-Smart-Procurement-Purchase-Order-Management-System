package com.aditya.enterpriseprocurementsystem.dto;

public class FeedbackRequest {

    private Integer requestId;
    private Integer rating;
    private String comment;
    private String comments;
    private Integer supplierRating;
    private Integer productQualityRating;
    private Integer deliveryRating;

    public Integer getRequestId() {
        return requestId;
    }

    public void setRequestId(Integer requestId) {
        this.requestId = requestId;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment != null ? comment : comments;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getComments() {
        return comments != null ? comments : comment;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public Integer getSupplierRating() {
        return supplierRating;
    }

    public void setSupplierRating(Integer supplierRating) {
        this.supplierRating = supplierRating;
    }

    public Integer getProductQualityRating() {
        return productQualityRating;
    }

    public void setProductQualityRating(Integer productQualityRating) {
        this.productQualityRating = productQualityRating;
    }

    public Integer getDeliveryRating() {
        return deliveryRating;
    }

    public void setDeliveryRating(Integer deliveryRating) {
        this.deliveryRating = deliveryRating;
    }
}