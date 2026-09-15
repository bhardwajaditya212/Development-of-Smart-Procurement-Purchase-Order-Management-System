package com.aditya.enterpriseprocurementsystem.dto;

public class ApprovalResponse {

    private String message;
    private Integer requestId;
    private String status;

    public ApprovalResponse() {
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
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
}
