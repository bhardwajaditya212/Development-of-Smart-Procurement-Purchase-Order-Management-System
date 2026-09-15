package com.aditya.enterpriseprocurementsystem.dto;

import java.time.LocalDateTime;

public class DeliveryResponse {

    private Integer deliveryId;
    private Integer requestId;
    private String status;
    private String remarks;
    private String carrierName;
    private String trackingNumber;
    private LocalDateTime deliveryDate;
    private LocalDateTime updatedDate;

    public DeliveryResponse() {
    }

    public DeliveryResponse(
            Integer deliveryId,
            Integer requestId,
            String status,
            String remarks,
            LocalDateTime deliveryDate,
            LocalDateTime updatedDate) {

        this.deliveryId = deliveryId;
        this.requestId = requestId;
        this.status = status;
        this.remarks = remarks;
        this.deliveryDate = deliveryDate;
        this.updatedDate = updatedDate;
    }

    public Integer getDeliveryId() {
        return deliveryId;
    }

    public void setDeliveryId(Integer deliveryId) {
        this.deliveryId = deliveryId;
    }

    public Integer getRequestId() {
        return requestId;
    }

    public void setRequestId(Integer requestId) {
        this.requestId = requestId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
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

    public LocalDateTime getDeliveryDate() {
        return deliveryDate;
    }

    public void setDeliveryDate(LocalDateTime deliveryDate) {
        this.deliveryDate = deliveryDate;
    }

    public LocalDateTime getUpdatedDate() {
        return updatedDate;
    }

    public void setUpdatedDate(LocalDateTime updatedDate) {
        this.updatedDate = updatedDate;
    }
}