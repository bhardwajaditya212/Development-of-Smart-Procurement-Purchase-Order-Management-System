package com.aditya.enterpriseprocurementsystem.controller;

import com.aditya.enterpriseprocurementsystem.dto.SupplierOrderResponse;
import com.aditya.enterpriseprocurementsystem.dto.SupplierResponse;
import com.aditya.enterpriseprocurementsystem.entity.Supplier;
import com.aditya.enterpriseprocurementsystem.service.SupplierService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/supplier")
public class SupplierController {

    @Autowired
    private SupplierService supplierService;

    // =====================================================
    // GET ASSIGNED ORDERS FOR A SUPPLIER (PAID ONLY)
    // =====================================================
    @GetMapping("/{supplierId}/orders")
    public ResponseEntity<List<SupplierOrderResponse>> getSupplierOrders(@PathVariable Integer supplierId) {
        return ResponseEntity.ok(supplierService.getSupplierOrders(supplierId));
    }

    // =====================================================
    // GET ALL PAID ORDERS (ADMIN / SYSTEM VIEW)
    // =====================================================
    @GetMapping("/orders")
    public ResponseEntity<List<SupplierOrderResponse>> getAllPaidOrders() {
        return ResponseEntity.ok(supplierService.getAllPaidOrders());
    }

    // =====================================================
    // UPDATE ORDER STATUS (BY SUPPLIER)
    // =====================================================
    @PutMapping("/orders/{requestId}/status")
    public ResponseEntity<?> updateSupplierOrderStatus(
            @PathVariable Integer requestId,
            @RequestBody Map<String, Object> body) {
        try {
            String newStatus = (String) body.get("deliveryStatus");
            if (newStatus == null) {
                newStatus = (String) body.get("status");
            }
            String remarks = (String) body.get("remarks");
            if (remarks == null) {
                remarks = (String) body.get("logisticsRemarks");
            }

            String carrierName = (String) body.get("carrierName");
            String trackingNumber = (String) body.get("trackingNumber");
            if (trackingNumber == null) {
                trackingNumber = (String) body.get("awbNumber");
            }

            Integer supplierId = body.get("supplierId") != null ? Integer.parseInt(body.get("supplierId").toString()) : null;

            SupplierOrderResponse response = supplierService.updateSupplierOrderStatus(
                    requestId, newStatus, remarks, supplierId, carrierName, trackingNumber
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // =====================================================
    // CREATE SUPPLIER
    // =====================================================
    @PostMapping
    public ResponseEntity<SupplierResponse> createSupplier(@RequestBody Supplier supplier) {
        SupplierResponse response = supplierService.addSupplier(supplier);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // =====================================================
    // GET ALL SUPPLIERS
    // =====================================================
    @GetMapping
    public ResponseEntity<List<SupplierResponse>> getAllSuppliers() {
        List<SupplierResponse> suppliers = supplierService.getAllSuppliers();
        return ResponseEntity.ok(suppliers);
    }

    // =====================================================
    // GET SUPPLIER BY ID
    // =====================================================
    @GetMapping("/{supplierId}")
    public ResponseEntity<SupplierResponse> getSupplierById(@PathVariable Integer supplierId) {
        SupplierResponse response = supplierService.getSupplierById(supplierId);
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }

    // =====================================================
    // DOWNLOAD SUPPLIERS CSV
    // =====================================================
    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadSuppliersCsv() {
        List<SupplierResponse> suppliers = supplierService.getAllSuppliers();
        StringBuilder csv = new StringBuilder();

        csv.append("Supplier ID,Product ID,Product Name,Name,Phone,Address,Email,GST Number,Status,Rating\n");

        for (SupplierResponse supplier : suppliers) {
            csv.append(supplier.getSupplierId()).append(",");
            csv.append(supplier.getProductId()).append(",");
            csv.append("\"").append(supplier.getProductName()).append("\"").append(",");
            csv.append("\"").append(supplier.getName()).append("\"").append(",");
            csv.append(supplier.getPhone()).append(",");
            csv.append("\"").append(supplier.getAddress()).append("\"").append(",");
            csv.append(supplier.getEmail()).append(",");
            csv.append(supplier.getGstNumber()).append(",");
            csv.append(supplier.getStatus()).append(",");
            csv.append(supplier.getRating()).append("\n");
        }

        byte[] csvBytes = csv.toString().getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=suppliers.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }
}