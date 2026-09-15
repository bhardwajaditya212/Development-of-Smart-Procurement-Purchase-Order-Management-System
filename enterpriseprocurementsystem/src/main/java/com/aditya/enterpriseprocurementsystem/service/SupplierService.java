package com.aditya.enterpriseprocurementsystem.service;

import com.aditya.enterpriseprocurementsystem.dto.SupplierOrderResponse;
import com.aditya.enterpriseprocurementsystem.dto.SupplierResponse;
import com.aditya.enterpriseprocurementsystem.entity.*;
import com.aditya.enterpriseprocurementsystem.enums.RequestStatus;
import com.aditya.enterpriseprocurementsystem.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private RequestRepository requestRepository;

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private MailService mailService;

    // =====================================================
    // GET ASSIGNED ORDERS FOR A SUPPLIER (APPROVED + PAID)
    // =====================================================
    public List<SupplierOrderResponse> getSupplierOrders(Integer supplierId) {
        List<SupplierOrderResponse> responseList = new ArrayList<>();
        List<Request> approvedRequests = requestRepository.findByStatus(RequestStatus.APPROVED);

        for (Request req : approvedRequests) {
            String payStatus = req.getPaymentStatus();
            // Business rule: All PAID / PAYMENT_SUCCESSFUL orders are visible and actionable in the supplier module
            if (payStatus != null && (payStatus.equalsIgnoreCase("PAYMENT_SUCCESSFUL") || payStatus.equalsIgnoreCase("PAID"))) {
                responseList.add(convertToOrderResponse(req));
            }
        }

        return responseList;
    }

    // =====================================================
    // GET ALL PAID ORDERS (FOR ADMIN / GENERAL PORTAL)
    // =====================================================
    public List<SupplierOrderResponse> getAllPaidOrders() {
        List<SupplierOrderResponse> responseList = new ArrayList<>();
        List<Request> approvedRequests = requestRepository.findByStatus(RequestStatus.APPROVED);

        for (Request req : approvedRequests) {
            String payStatus = req.getPaymentStatus();
            if (payStatus != null && (payStatus.equalsIgnoreCase("PAYMENT_SUCCESSFUL") || payStatus.equalsIgnoreCase("PAID"))) {
                responseList.add(convertToOrderResponse(req));
            }
        }

        return responseList;
    }

    // =====================================================
    // UPDATE ORDER FULFILLMENT STATUS (BY SUPPLIER)
    // =====================================================
    public SupplierOrderResponse updateSupplierOrderStatus(
            Integer requestId,
            String newStatus,
            String remarks,
            Integer supplierId,
            String carrierName,
            String trackingNumber) {

        Optional<Request> reqOpt = requestRepository.findById(requestId);
        if (reqOpt.isEmpty()) {
            throw new RuntimeException("Request Not Found with ID #" + requestId);
        }

        Request request = reqOpt.get();

        // 1. Ensure Approval & Payment flags are active
        if (request.getStatus() != RequestStatus.APPROVED) {
            request.setStatus(RequestStatus.APPROVED);
        }
        if (request.getPaymentStatus() == null ||
                (!request.getPaymentStatus().equalsIgnoreCase("PAYMENT_SUCCESSFUL") && !request.getPaymentStatus().equalsIgnoreCase("PAID"))) {
            request.setPaymentStatus("PAYMENT_SUCCESSFUL");
        }
        requestRepository.save(request);

        // 2. Fetch/Initialize Delivery
        Optional<Delivery> deliveryOpt = deliveryRepository.findByRequest_RequestId(requestId);
        Delivery delivery = deliveryOpt.orElse(new Delivery());
        delivery.setRequest(request);

        String currentStatus = (delivery.getStatus() != null && !delivery.getStatus().isBlank())
                ? delivery.getStatus().trim().toUpperCase() : "READY_FOR_FULFILLMENT";
        String targetStatus = (newStatus != null && !newStatus.isBlank()) ? newStatus.trim().toUpperCase() : currentStatus;

        // 3. Flexible Status Update (Support ACCEPTED, PROCESSING, SHIPPED, DELIVERED)
        if (targetStatus != null && !targetStatus.isBlank()) {
            delivery.setStatus(targetStatus);
        }

        // 4. Update Delivery Entity
        delivery.setStatus(targetStatus);
        delivery.setUpdatedDate(LocalDateTime.now());

        if (carrierName != null && !carrierName.isBlank()) {
            delivery.setCarrierName(carrierName);
        }
        if (trackingNumber != null && !trackingNumber.isBlank()) {
            delivery.setTrackingNumber(trackingNumber);
        }

        if (remarks != null && !remarks.isBlank()) {
            delivery.setRemarks(remarks);
        } else {
            delivery.setRemarks("Order status updated to " + targetStatus + " by Supplier.");
        }

        if (targetStatus.equals("DELIVERED")) {
            delivery.setDeliveryDate(LocalDateTime.now());
        }

        Delivery savedDelivery = deliveryRepository.save(delivery);

        // 5. Send Live Tracking Email Updates via MailService to User & Admin
        try {
            if (request.getUser() != null && request.getUser().getEmail() != null) {
                mailService.sendDeliveryStatusMail(request.getUser().getEmail(), savedDelivery);
            }

            // Dispatch email to department admin or all admins
            if (request.getDepartment() != null && request.getDepartment().getDepartmentId() != null) {
                Optional<Admin> adminOpt = adminRepository.findByDepartment_DepartmentId(request.getDepartment().getDepartmentId());
                if (adminOpt.isPresent() && adminOpt.get().getEmail() != null) {
                    mailService.sendDeliveryStatusMailToAdmin(adminOpt.get().getEmail(), savedDelivery);
                } else {
                    List<Admin> allAdmins = adminRepository.findAll();
                    for (Admin a : allAdmins) {
                        if (a.getEmail() != null) {
                            mailService.sendDeliveryStatusMailToAdmin(a.getEmail(), savedDelivery);
                        }
                    }
                }
            } else {
                List<Admin> allAdmins = adminRepository.findAll();
                for (Admin a : allAdmins) {
                    if (a.getEmail() != null) {
                        mailService.sendDeliveryStatusMailToAdmin(a.getEmail(), savedDelivery);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Delivery status mail dispatch warning: " + e.getMessage());
        }

        return convertToOrderResponse(request);
    }

    public SupplierOrderResponse updateSupplierOrderStatus(Integer requestId, String newStatus, String remarks, Integer supplierId) {
        return updateSupplierOrderStatus(requestId, newStatus, remarks, supplierId, null, null);
    }

    // =====================================================
    // CONVERT REQUEST → SUPPLIER ORDER RESPONSE DTO
    // =====================================================
    private SupplierOrderResponse convertToOrderResponse(Request req) {
        SupplierOrderResponse res = new SupplierOrderResponse();
        res.setRequestId(req.getRequestId());
        res.setPoNumber("PO-" + String.format("%04d", req.getRequestId()));

        if (req.getProduct() != null) {
            res.setProductId(req.getProduct().getProductId());
            res.setProductName(req.getProduct().getName());
            double price = req.getProduct().getPricePerProduct() != null ? req.getProduct().getPricePerProduct() : 0.0;
            int qty = req.getQuantity() != null ? req.getQuantity() : 1;
            res.setUnitPrice(price);
            res.setQuantity(qty);
            res.setTotalAmount(price * qty);
        }

        if (req.getDepartment() != null) {
            res.setDepartmentId(req.getDepartment().getDepartmentId());
            res.setDepartmentName(req.getDepartment().getDepartmentName());
        }

        if (req.getUser() != null) {
            res.setUserName(req.getUser().getName());
            res.setUserEmail(req.getUser().getEmail());
        }

        res.setRequestStatus(req.getStatus() != null ? req.getStatus().toString() : "APPROVED");
        res.setPaymentStatus(req.getPaymentStatus() != null ? req.getPaymentStatus() : "PAYMENT_SUCCESSFUL");
        res.setCreatedDate(req.getCreatedDate() != null ? req.getCreatedDate().toString() : "");

        // Find Transaction ID if paid
        Optional<Payment> paymentOpt = paymentRepository.findByRequest_RequestId(req.getRequestId());
        if (paymentOpt.isPresent()) {
            res.setTransactionId(paymentOpt.get().getTransactionId());
        }

        // Find Delivery Status
        Optional<Delivery> deliveryOpt = deliveryRepository.findByRequest_RequestId(req.getRequestId());
        if (deliveryOpt.isPresent()) {
            Delivery d = deliveryOpt.get();
            res.setDeliveryStatus(d.getStatus() != null ? d.getStatus() : "READY_FOR_FULFILLMENT");
            res.setCarrierName(d.getCarrierName());
            res.setTrackingNumber(d.getTrackingNumber());
            res.setDeliveryDate(d.getDeliveryDate() != null ? d.getDeliveryDate().toString() : "");
            res.setRemarks(d.getRemarks());
        } else {
            res.setDeliveryStatus("READY_FOR_FULFILLMENT");
        }

        return res;
    }

    // =========================
    // Add Supplier
    // =========================
    public SupplierResponse addSupplier(Supplier supplier) {
        SupplierResponse response = new SupplierResponse();

        if (supplier.getProduct() == null || supplier.getProduct().getProductId() == null) {
            response.setProductId(null);
            response.setProductName("Product is required");
            return response;
        }

        Optional<Product> product = productRepository.findById(supplier.getProduct().getProductId());
        if (product.isEmpty()) {
            response.setProductId(supplier.getProduct().getProductId());
            response.setProductName("Product Not Found");
            return response;
        }

        supplier.setProduct(product.get());
        if (supplier.getStatus() == null || supplier.getStatus().isBlank()) {
            supplier.setStatus("ACTIVE");
        }

        Supplier savedSupplier = supplierRepository.save(supplier);
        return convertToResponse(savedSupplier);
    }

    // =========================
    // Get All Suppliers
    // =========================
    public List<SupplierResponse> getAllSuppliers() {
        List<Supplier> suppliers = supplierRepository.findAll();
        List<SupplierResponse> responseList = new ArrayList<>();

        for (Supplier supplier : suppliers) {
            responseList.add(convertToResponse(supplier));
        }

        return responseList;
    }

    // =========================
    // Get Supplier By ID
    // =========================
    public SupplierResponse getSupplierById(Integer supplierId) {
        Optional<Supplier> supplier = supplierRepository.findById(supplierId);
        if (supplier.isEmpty()) {
            return null;
        }
        return convertToResponse(supplier.get());
    }

    // =========================
    // Convert Entity → Response
    // =========================
    private SupplierResponse convertToResponse(Supplier supplier) {
        SupplierResponse response = new SupplierResponse();
        response.setSupplierId(supplier.getSupplierId());

        if (supplier.getProduct() != null) {
            response.setProductId(supplier.getProduct().getProductId());
            response.setProductName(supplier.getProduct().getName());
        }

        response.setName(supplier.getName());
        response.setPhone(supplier.getPhone());
        response.setAddress(supplier.getAddress());
        response.setEmail(supplier.getEmail());
        response.setGstNumber(supplier.getGstNumber());
        response.setStatus(supplier.getStatus());
        response.setRating(supplier.getRating());

        return response;
    }
}