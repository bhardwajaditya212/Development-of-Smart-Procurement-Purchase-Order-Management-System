package com.aditya.enterpriseprocurementsystem.service;

import com.aditya.enterpriseprocurementsystem.dto.DeliveryResponse;
import com.aditya.enterpriseprocurementsystem.entity.Delivery;
import com.aditya.enterpriseprocurementsystem.entity.Request;
import com.aditya.enterpriseprocurementsystem.repository.DeliveryRepository;
import com.aditya.enterpriseprocurementsystem.repository.RequestRepository;
import com.aditya.enterpriseprocurementsystem.entity.Admin;
import com.aditya.enterpriseprocurementsystem.repository.AdminRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final RequestRepository requestRepository;
    private final MailService mailService;
    private final AdminRepository adminRepository;
    public DeliveryService(
            DeliveryRepository deliveryRepository,
            RequestRepository requestRepository,
            MailService mailService,
            AdminRepository adminRepository) {

        this.deliveryRepository = deliveryRepository;
        this.requestRepository = requestRepository;
        this.mailService = mailService;
        this.adminRepository = adminRepository;
    }


    // =====================================================
    // CREATE DELIVERY
    // =====================================================

    public DeliveryResponse createDelivery(
            Integer requestId,
            Delivery delivery) {

        Optional<Request> requestOptional =
                requestRepository.findById(requestId);

        if (requestOptional.isEmpty()) {

            throw new RuntimeException(
                    "Request Not Found"
            );
        }

        Optional<Delivery> existingDelivery =
                deliveryRepository
                        .findByRequest_RequestId(requestId);

        if (existingDelivery.isPresent()) {

            throw new RuntimeException(
                    "Delivery already exists for this request"
            );
        }

        Request request =
                requestOptional.get();

        delivery.setRequest(request);

        if (delivery.getStatus() == null ||
                delivery.getStatus().isBlank()) {

            delivery.setStatus("PROCESSING");
        }

        if (delivery.getDeliveryDate() == null) {

            delivery.setDeliveryDate(
                    LocalDateTime.now()
            );
        }

        delivery.setUpdatedDate(
                LocalDateTime.now()
        );

        Delivery savedDelivery =
                deliveryRepository.save(delivery);


        // Send email to requesting user
        sendDeliveryEmail(savedDelivery);


        return convertToResponse(
                savedDelivery
        );
    }


    // =====================================================
    // GET DELIVERY BY REQUEST ID
    // =====================================================

    public DeliveryResponse getDeliveryByRequestId(
            Integer requestId) {

        Optional<Delivery> delivery =
                deliveryRepository
                        .findByRequest_RequestId(requestId);

        if (delivery.isEmpty()) {

            throw new RuntimeException(
                    "Delivery Not Found"
            );
        }

        return convertToResponse(
                delivery.get()
        );
    }


    // =====================================================
    // UPDATE DELIVERY STATUS
    // =====================================================

    public DeliveryResponse updateDeliveryStatus(
            Integer requestId,
            String status) {

        Optional<Delivery> deliveryOptional =
                deliveryRepository
                        .findByRequest_RequestId(requestId);

        if (deliveryOptional.isEmpty()) {

            throw new RuntimeException(
                    "Delivery Not Found"
            );
        }

        if (status == null ||
                status.isBlank()) {

            throw new RuntimeException(
                    "Delivery Status is required"
            );
        }

        Delivery delivery =
                deliveryOptional.get();


        // =====================================================
        // CURRENT STATUS
        // =====================================================

        String currentStatus =
                delivery.getStatus();

        if (currentStatus == null ||
                currentStatus.isBlank()) {

            currentStatus = "PROCESSING";
        }

        currentStatus =
                currentStatus.toUpperCase();


        // =====================================================
        // NEW STATUS
        // =====================================================

        String newStatus =
                status.trim().toUpperCase();


        // =====================================================
        // VALID STATUS
        // =====================================================

        if (!newStatus.equals("PROCESSING") &&
                !newStatus.equals("SHIPPED") &&
                !newStatus.equals("DELIVERED")) {

            throw new RuntimeException(
                    "Invalid Delivery Status. Use PROCESSING, SHIPPED or DELIVERED"
            );
        }


        // =====================================================
        // STATUS FLOW
        // =====================================================

        if (currentStatus.equals("PROCESSING")) {

            if (!newStatus.equals("SHIPPED")) {

                throw new RuntimeException(
                        "PROCESSING delivery can only be changed to SHIPPED"
                );
            }
        }


        if (currentStatus.equals("SHIPPED")) {

            if (!newStatus.equals("DELIVERED")) {

                throw new RuntimeException(
                        "SHIPPED delivery can only be changed to DELIVERED"
                );
            }
        }


        if (currentStatus.equals("DELIVERED")) {

            throw new RuntimeException(
                    "Delivered order status cannot be changed"
            );
        }


        // =====================================================
        // UPDATE STATUS
        // =====================================================

        delivery.setStatus(
                newStatus
        );

        delivery.setUpdatedDate(
                LocalDateTime.now()
        );


        // =====================================================
        // DELIVERED DETAILS
        // =====================================================

        if (newStatus.equals("DELIVERED")) {

            delivery.setRemarks(
                    "Order has been successfully delivered"
            );

            delivery.setDeliveryDate(
                    LocalDateTime.now()
            );
        }


        // =====================================================
        // SAVE DELIVERY
        // =====================================================

        Delivery updatedDelivery =
                deliveryRepository.save(delivery);


        // =====================================================
        // SEND STATUS EMAIL TO USER
        // =====================================================

        sendDeliveryEmail(
                updatedDelivery
        );


        return convertToResponse(
                updatedDelivery
        );
    }


    // =====================================================
    // MARK AS DELIVERED
    // =====================================================

    public DeliveryResponse markAsDelivered(
            Integer requestId) {

        Optional<Delivery> deliveryOptional =
                deliveryRepository
                        .findByRequest_RequestId(requestId);

        if (deliveryOptional.isEmpty()) {

            throw new RuntimeException(
                    "Delivery Not Found"
            );
        }

        Delivery delivery =
                deliveryOptional.get();

        if (delivery.getStatus() == null ||
                !delivery.getStatus()
                        .equalsIgnoreCase("SHIPPED")) {

            throw new RuntimeException(
                    "Delivery can be marked DELIVERED only after SHIPPED"
            );
        }

        delivery.setStatus("DELIVERED");

        delivery.setRemarks(
                "Order has been successfully delivered"
        );

        delivery.setDeliveryDate(
                LocalDateTime.now()
        );

        delivery.setUpdatedDate(
                LocalDateTime.now()
        );

        Delivery deliveredDelivery =
                deliveryRepository.save(delivery);


        // Send delivered email to user
        sendDeliveryEmail(
                deliveredDelivery
        );


        return convertToResponse(
                deliveredDelivery
        );
    }


    // =====================================================
    // SEND DELIVERY EMAIL
    // =====================================================

    private void sendDeliveryEmail(
            Delivery delivery) {

        Request request = delivery.getRequest();

        if (request == null) {
            return;
        }

        // =====================================================
        // SEND MAIL TO USER
        // =====================================================

        if (request.getUser() != null) {

            String userEmail =
                    request.getUser().getEmail();

            if (userEmail != null &&
                    !userEmail.isBlank()) {

                mailService.sendDeliveryStatusMail(
                        userEmail,
                        delivery
                );
            }
        }


        // =====================================================
        // SEND MAIL TO DEPARTMENT ADMIN
        // =====================================================

        if (request.getDepartment() != null) {

            Integer departmentId =
                    request.getDepartment()
                            .getDepartmentId();

            Optional<Admin> admin =
                    adminRepository
                            .findByDepartment_DepartmentId(
                                    departmentId
                            );

            if (admin.isPresent()) {

                String adminEmail =
                        admin.get().getEmail();

                if (adminEmail != null &&
                        !adminEmail.isBlank()) {

                    mailService.sendDeliveryStatusMailToAdmin(
                            adminEmail,
                            delivery
                    );
                }
            }
        }
    }

    // =====================================================
    // CONVERT ENTITY → DTO
    // =====================================================

    private DeliveryResponse convertToResponse(
            Delivery delivery) {

        DeliveryResponse response =
                new DeliveryResponse();

        response.setDeliveryId(
                delivery.getDeliveryId()
        );

        if (delivery.getRequest() != null) {

            response.setRequestId(
                    delivery.getRequest()
                            .getRequestId()
            );
        }

        response.setStatus(
                delivery.getStatus()
        );

        response.setRemarks(
                delivery.getRemarks()
        );

        response.setCarrierName(
                delivery.getCarrierName()
        );

        response.setTrackingNumber(
                delivery.getTrackingNumber()
        );

        response.setDeliveryDate(
                delivery.getDeliveryDate()
        );

        response.setUpdatedDate(
                delivery.getUpdatedDate()
        );

        return response;
    }
}