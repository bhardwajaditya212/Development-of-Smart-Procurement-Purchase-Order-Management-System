package com.aditya.enterpriseprocurementsystem.controller;

import com.aditya.enterpriseprocurementsystem.dto.PendingRequestResponse;
import com.aditya.enterpriseprocurementsystem.dto.PaymentResponse;
import com.aditya.enterpriseprocurementsystem.dto.ProcessPaymentRequest;
import com.aditya.enterpriseprocurementsystem.entity.Payment;
import com.aditya.enterpriseprocurementsystem.service.PaymentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // =====================================================
    // GET PENDING ORDERS AWAITING PAYMENT
    // =====================================================
    @GetMapping("/pending-orders")
    public ResponseEntity<List<PendingRequestResponse>> getPendingPaymentOrders() {
        return ResponseEntity.ok(paymentService.getPendingPaymentOrders());
    }

    // =====================================================
    // PROCESS ADMIN PAYMENT (GPay, PhonePe, Card)
    // =====================================================
    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody ProcessPaymentRequest paymentRequest) {
        try {
            PaymentResponse response = paymentService.processPayment(paymentRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // =====================================================
    // CREATE PAYMENT (Legacy Support)
    // =====================================================
    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(@RequestBody Payment payment) {
        PaymentResponse response = paymentService.createPayment(payment);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // =====================================================
    // GET ALL PAYMENTS / HISTORY
    // =====================================================
    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    // =====================================================
    // GET PAYMENT BY ID
    // =====================================================
    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Integer id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    // =====================================================
    // UPDATE PAYMENT STATUS
    // =====================================================
    @PutMapping("/{id}/status")
    public ResponseEntity<PaymentResponse> updatePaymentStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request) {

        String status = request.get("paymentStatus");
        PaymentResponse response = paymentService.updatePaymentStatus(id, status);
        return ResponseEntity.ok(response);
    }

    // =====================================================
    // DOWNLOAD PAYMENTS CSV
    // =====================================================
    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadPaymentsCsv() {
        byte[] csvBytes = paymentService.downloadPaymentsCsv();
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=payments.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }
}