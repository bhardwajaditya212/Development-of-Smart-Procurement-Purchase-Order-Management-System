package com.aditya.enterpriseprocurementsystem.service;

import com.aditya.enterpriseprocurementsystem.dto.PendingRequestResponse;
import com.aditya.enterpriseprocurementsystem.dto.ProcessPaymentRequest;
import com.aditya.enterpriseprocurementsystem.dto.PaymentResponse;
import com.aditya.enterpriseprocurementsystem.entity.Admin;
import com.aditya.enterpriseprocurementsystem.entity.Delivery;
import com.aditya.enterpriseprocurementsystem.entity.Payment;
import com.aditya.enterpriseprocurementsystem.entity.Request;
import com.aditya.enterpriseprocurementsystem.entity.Supplier;
import com.aditya.enterpriseprocurementsystem.enums.RequestStatus;
import com.aditya.enterpriseprocurementsystem.repository.AdminRepository;
import com.aditya.enterpriseprocurementsystem.repository.DeliveryRepository;
import com.aditya.enterpriseprocurementsystem.repository.PaymentRepository;
import com.aditya.enterpriseprocurementsystem.repository.RequestRepository;
import com.aditya.enterpriseprocurementsystem.repository.SupplierRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private RequestRepository requestRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private MailService mailService;

    // =====================================================
    // GET PENDING ORDERS AWAITING ADMIN PAYMENT
    // =====================================================
    public List<PendingRequestResponse> getPendingPaymentOrders() {
        List<PendingRequestResponse> responseList = new ArrayList<>();
        List<Request> approvedRequests = requestRepository.findByStatus(RequestStatus.APPROVED);

        for (Request req : approvedRequests) {
            String payStatus = req.getPaymentStatus();
            if (payStatus == null || payStatus.equalsIgnoreCase("UNPAID") || payStatus.equalsIgnoreCase("PAYMENT_REQUIRED")) {
                PendingRequestResponse res = new PendingRequestResponse();
                res.setRequestId(req.getRequestId());
                res.setProduct(req.getProduct() != null ? req.getProduct().getName() : "Procured Product");
                res.setDepartment(req.getDepartment() != null ? req.getDepartment().getDepartmentName() : "IT Department");
                
                int qty = (req.getQuantity() != null && req.getQuantity() > 0) ? req.getQuantity() : 1;
                res.setQuantity(qty);
                
                double price = (req.getProduct() != null && req.getProduct().getPricePerProduct() != null && req.getProduct().getPricePerProduct() > 0) 
                        ? req.getProduct().getPricePerProduct() : 700.0;
                
                double calculatedTotal = price * qty;

                res.setPricePerProduct(price);
                res.setUnitPrice(price);
                res.setTotalCost(calculatedTotal);
                res.setEstimatedCost(calculatedTotal);

                res.setStatus(req.getStatus() != null ? req.getStatus().toString() : "APPROVED");
                res.setCurrentApprovalLevel(req.getCurrentApprovalLevel() != null ? req.getCurrentApprovalLevel() : 3);
                res.setPaymentStatus("PAYMENT_REQUIRED");
                res.setCreatedDate(req.getCreatedDate() != null ? req.getCreatedDate().toString() : "");

                responseList.add(res);
            }
        }

        return responseList;
    }

    // =====================================================
    // PROCESS ADMIN PAYMENT (GPay, PhonePe, Card)
    // =====================================================
    public PaymentResponse processPayment(ProcessPaymentRequest paymentRequest) {
        if (paymentRequest == null || paymentRequest.getRequestId() == null) {
            throw new RuntimeException("Request ID is required for payment processing");
        }

        Optional<Request> requestOpt = requestRepository.findById(paymentRequest.getRequestId());
        if (requestOpt.isEmpty()) {
            throw new RuntimeException("Request Not Found with ID #" + paymentRequest.getRequestId());
        }

        Request request = requestOpt.get();

        // 1. Compute Real Amount from Database
        double unitPrice = (request.getProduct() != null && request.getProduct().getPricePerProduct() != null && request.getProduct().getPricePerProduct() > 0)
                ? request.getProduct().getPricePerProduct() : 700.0;
        int quantity = (request.getQuantity() != null && request.getQuantity() > 0) ? request.getQuantity() : 1;
        double calculatedTotal = unitPrice * quantity;

        // 2. Map Supplier (Find mapped supplier by Product or pick available active supplier)
        Supplier supplier = null;
        if (request.getProduct() != null && request.getProduct().getProductId() != null) {
            List<Supplier> suppliers = supplierRepository.findByProduct_ProductId(request.getProduct().getProductId());
            if (!suppliers.isEmpty()) {
                supplier = suppliers.get(0);
            }
        }
        if (supplier == null) {
            List<Supplier> allSuppliers = supplierRepository.findAll();
            if (!allSuppliers.isEmpty()) {
                supplier = allSuppliers.get(0);
            }
        }

        // 3. Ensure Request is Approved
        if (request.getStatus() != RequestStatus.APPROVED) {
            request.setStatus(RequestStatus.APPROVED);
            requestRepository.save(request);
        }

        Optional<Payment> existingPaymentOpt = paymentRepository.findByRequest_RequestId(request.getRequestId());

        // 4. Handle Simulated Failure
        if (Boolean.TRUE.equals(paymentRequest.getSimulateFailure())) {
            Payment failedPayment = existingPaymentOpt.orElseGet(Payment::new);
            failedPayment.setRequest(request);
            failedPayment.setSupplier(supplier);
            failedPayment.setPaymentMethod(paymentRequest.getPaymentMethod() != null ? paymentRequest.getPaymentMethod() : "Digital Gateway");
            failedPayment.setAmount(calculatedTotal);
            failedPayment.setPaymentDate(LocalDateTime.now());
            failedPayment.setPaymentStatus("FAILED");
            failedPayment.setFailureReason("Bank gateway declined / Simulated demo failure");
            failedPayment.setTransactionId("TXN-FAIL-" + System.currentTimeMillis());

            Payment savedFailed = paymentRepository.save(failedPayment);

            request.setPaymentStatus("FAILED");
            requestRepository.save(request);

            return convertToResponse(savedFailed);
        }

        // 5. Handle Successful Payment
        String today = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String txnId = "TXN-" + today + "-" + String.format("%06d", request.getRequestId());

        Payment payment = existingPaymentOpt.orElseGet(Payment::new);
        payment.setRequest(request);
        payment.setSupplier(supplier);
        payment.setPaymentMethod(paymentRequest.getPaymentMethod() != null ? paymentRequest.getPaymentMethod() : "Google Pay");
        payment.setTransactionId(txnId);
        payment.setAmount(calculatedTotal);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setPaymentStatus("SUCCESSFUL");
        payment.setFailureReason(null);

        if (supplier != null) {
            payment.setAccountHolderName(supplier.getName());
            payment.setBankName("HDFC Corporate Bank");
            payment.setAccountNumber("****" + (supplier.getPhone() != null && supplier.getPhone().length() >= 4 ? supplier.getPhone().substring(supplier.getPhone().length() - 4) : "1234"));
            payment.setIfscCode("HDFC0001020");
        }

        Payment savedPayment = paymentRepository.save(payment);

        // 6. Update Request Status to PAYMENT_SUCCESSFUL
        request.setPaymentStatus("PAYMENT_SUCCESSFUL");
        requestRepository.save(request);

        // 7. Unlock Supplier Fulfillment & Initialize Delivery
        Optional<Delivery> deliveryOpt = deliveryRepository.findByRequest_RequestId(request.getRequestId());
        if (deliveryOpt.isEmpty()) {
            Delivery delivery = new Delivery();
            delivery.setRequest(request);
            delivery.setStatus("READY_FOR_FULFILLMENT");
            delivery.setRemarks("Payment cleared by Admin (" + payment.getPaymentMethod() + "). Purchase Order released to supplier.");
            delivery.setUpdatedDate(LocalDateTime.now());
            deliveryRepository.save(delivery);
        } else {
            Delivery delivery = deliveryOpt.get();
            if (delivery.getStatus() == null || delivery.getStatus().equalsIgnoreCase("READY_FOR_FULFILLMENT")) {
                delivery.setStatus("READY_FOR_FULFILLMENT");
                delivery.setRemarks("Payment cleared by Admin (" + payment.getPaymentMethod() + "). Purchase Order released to supplier.");
                delivery.setUpdatedDate(LocalDateTime.now());
                deliveryRepository.save(delivery);
            }
        }

        // 8. Dispatch Email Notifications
        try {
            if (request.getUser() != null && request.getUser().getEmail() != null) {
                mailService.sendPaymentSuccessMail(request.getUser().getEmail(), request, savedPayment);
            }
            if (supplier != null && supplier.getEmail() != null) {
                mailService.sendSupplierOrderMail(supplier.getEmail(), request, savedPayment);
            }
            List<Admin> admins = adminRepository.findAll();
            for (Admin admin : admins) {
                if (admin.getEmail() != null) {
                    mailService.sendPaymentSuccessMailToAdmin(admin.getEmail(), request, savedPayment);
                }
            }
        } catch (Exception e) {
            System.err.println("Email dispatch warning after payment: " + e.getMessage());
        }

        return convertToResponse(savedPayment);
    }

    // =====================================================
    // UPDATE PAYMENT STATUS
    // =====================================================
    public PaymentResponse updatePaymentStatus(Integer paymentId, String status) {
        Optional<Payment> paymentOpt = paymentRepository.findById(paymentId);
        if (paymentOpt.isEmpty()) {
            throw new RuntimeException("Payment Not Found with ID #" + paymentId);
        }
        Payment payment = paymentOpt.get();
        payment.setPaymentStatus(status);
        Payment saved = paymentRepository.save(payment);
        return convertToResponse(saved);
    }

    // =====================================================
    // DOWNLOAD PAYMENTS CSV
    // =====================================================
    public byte[] downloadPaymentsCsv() {
        List<PaymentResponse> payments = getAllPayments();
        StringBuilder csv = new StringBuilder();
        csv.append("Payment ID,Request ID,Product Name,Supplier Name,Payment Method,Transaction ID,Amount,Status,Date\n");

        for (PaymentResponse p : payments) {
            csv.append(p.getPaymentId()).append(",");
            csv.append(p.getRequestId()).append(",");
            csv.append("\"").append(p.getProductName() != null ? p.getProductName() : "Item").append("\"").append(",");
            csv.append("\"").append(p.getSupplierName() != null ? p.getSupplierName() : "Supplier").append("\"").append(",");
            csv.append(p.getPaymentMethod()).append(",");
            csv.append(p.getTransactionId()).append(",");
            csv.append(p.getAmount()).append(",");
            csv.append(p.getPaymentStatus()).append(",");
            csv.append(p.getPaymentDate()).append("\n");
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    // =====================================================
    // CREATE PAYMENT (Legacy Support)
    // =====================================================
    public PaymentResponse createPayment(Payment payment) {
        if (payment == null) {
            throw new RuntimeException("Payment payload is required");
        }

        if (payment.getPaymentStatus() == null) {
            payment.setPaymentStatus("SUCCESSFUL");
        }
        if (payment.getPaymentDate() == null) {
            payment.setPaymentDate(LocalDateTime.now());
        }

        Payment saved = paymentRepository.save(payment);
        return convertToResponse(saved);
    }

    // =====================================================
    // GET ALL PAYMENTS
    // =====================================================
    public List<PaymentResponse> getAllPayments() {
        List<Payment> payments = paymentRepository.findAll();
        List<PaymentResponse> responseList = new ArrayList<>();

        for (Payment payment : payments) {
            responseList.add(convertToResponse(payment));
        }

        return responseList;
    }

    // =====================================================
    // GET PAYMENT BY ID
    // =====================================================
    public PaymentResponse getPaymentById(Integer paymentId) {
        Optional<Payment> paymentOpt = paymentRepository.findById(paymentId);
        if (paymentOpt.isEmpty()) {
            throw new RuntimeException("Payment Record Not Found with ID #" + paymentId);
        }
        return convertToResponse(paymentOpt.get());
    }

    // =====================================================
    // CONVERT ENTITY → DTO
    // =====================================================
    private PaymentResponse convertToResponse(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setPaymentId(payment.getPaymentId());

        if (payment.getRequest() != null) {
            response.setRequestId(payment.getRequest().getRequestId());
            if (payment.getRequest().getProduct() != null) {
                response.setProductName(payment.getRequest().getProduct().getName());
            }
        }

        if (payment.getSupplier() != null) {
            response.setSupplierId(payment.getSupplier().getSupplierId());
            response.setSupplierName(payment.getSupplier().getName());
        }

        response.setPaymentMethod(payment.getPaymentMethod());
        response.setTransactionId(payment.getTransactionId());
        response.setAccountHolderName(payment.getAccountHolderName());
        response.setAccountNumber(payment.getAccountNumber());
        response.setIfscCode(payment.getIfscCode());
        response.setBankName(payment.getBankName());
        response.setAmount(payment.getAmount());
        response.setPaymentDate(payment.getPaymentDate() != null ? payment.getPaymentDate().toString() : "");
        response.setPaymentStatus(payment.getPaymentStatus());
        response.setFailureReason(payment.getFailureReason());

        return response;
    }
}