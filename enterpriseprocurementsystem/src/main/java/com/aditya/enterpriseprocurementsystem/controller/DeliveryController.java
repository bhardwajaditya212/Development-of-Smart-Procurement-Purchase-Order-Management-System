package com.aditya.enterpriseprocurementsystem.controller;

import com.aditya.enterpriseprocurementsystem.dto.DeliveryResponse;
import com.aditya.enterpriseprocurementsystem.entity.Delivery;
import com.aditya.enterpriseprocurementsystem.service.DeliveryService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/delivery")
public class DeliveryController {

    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }


    // =========================
    // CREATE DELIVERY
    // =========================

    @PostMapping("/{requestId}")
    public ResponseEntity<DeliveryResponse> createDelivery(
            @PathVariable Integer requestId,
            @RequestBody Delivery delivery) {

        DeliveryResponse savedDelivery =
                deliveryService.createDelivery(
                        requestId,
                        delivery
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedDelivery);
    }


// =========================
// GET DELIVERY BY REQUEST ID
// =========================

    @GetMapping("/by-request/{requestId}")
    public ResponseEntity<DeliveryResponse> getDeliveryByRequestId(
            @PathVariable Integer requestId) {

        DeliveryResponse delivery =
                deliveryService.getDeliveryByRequestId(requestId);

        return ResponseEntity.ok(delivery);
    }


    // =========================
    // UPDATE DELIVERY STATUS
    // =========================

    @PutMapping("/{requestId}/status")
    public ResponseEntity<DeliveryResponse> updateDeliveryStatus(
            @PathVariable Integer requestId,
            @RequestBody Map<String, String> request) {

        String status =
                request.get("status");

        DeliveryResponse updatedDelivery =
                deliveryService.updateDeliveryStatus(
                        requestId,
                        status
                );

        return ResponseEntity.ok(updatedDelivery);
    }


    // =========================
    // MARK DELIVERY AS DELIVERED
    // =========================

    @PutMapping("/{requestId}/delivered")
    public ResponseEntity<DeliveryResponse> markAsDelivered(
            @PathVariable Integer requestId) {

        DeliveryResponse deliveredDelivery =
                deliveryService.markAsDelivered(
                        requestId
                );

        return ResponseEntity.ok(deliveredDelivery);
    }
}