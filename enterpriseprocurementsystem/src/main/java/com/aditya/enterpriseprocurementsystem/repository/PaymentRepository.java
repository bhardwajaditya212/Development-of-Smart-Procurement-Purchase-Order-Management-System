package com.aditya.enterpriseprocurementsystem.repository;

import com.aditya.enterpriseprocurementsystem.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    Optional<Payment> findByRequest_RequestId(Integer requestId);
    List<Payment> findByPaymentStatus(String paymentStatus);
    List<Payment> findBySupplier_SupplierId(Integer supplierId);
}
