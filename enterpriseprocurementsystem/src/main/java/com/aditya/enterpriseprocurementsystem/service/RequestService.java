package com.aditya.enterpriseprocurementsystem.service;

import com.aditya.enterpriseprocurementsystem.dto.*;
import com.aditya.enterpriseprocurementsystem.entity.*;
import com.aditya.enterpriseprocurementsystem.enums.RequestStatus;
import com.aditya.enterpriseprocurementsystem.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class RequestService {

    @Autowired
    private MailService mailService;

    @Autowired
    private RequestRepository requestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    // =========================================================
    // CREATE REQUEST
    // =========================================================
    public RequestResponse createRequest(Request request) {
        RequestResponse response = new RequestResponse();

        User userEntity = null;
        if (request.getUser() != null && request.getUser().getUserId() != null) {
            Optional<User> uOpt = userRepository.findById(request.getUser().getUserId());
            if (uOpt.isPresent()) {
                userEntity = uOpt.get();
                if (request.getUser().getEmail() != null && !request.getUser().getEmail().isBlank()) {
                    userEntity.setEmail(request.getUser().getEmail());
                    userRepository.save(userEntity);
                }
            }
        }

        if (userEntity == null) {
            List<User> allUsers = userRepository.findAll();
            if (!allUsers.isEmpty()) {
                userEntity = allUsers.get(0);
            } else {
                response.setMessage("User Not Found");
                return response;
            }
        }

        if (request.getProduct() == null || request.getProduct().getProductId() == null) {
            response.setMessage("Product is required");
            return response;
        }

        Optional<Product> product = productRepository.findById(request.getProduct().getProductId());
        if (product.isEmpty()) {
            response.setMessage("Product Not Found");
            return response;
        }

        if (request.getDepartment() == null || request.getDepartment().getDepartmentId() == null) {
            response.setMessage("Department is required");
            return response;
        }

        Optional<Department> department = departmentRepository.findById(request.getDepartment().getDepartmentId());
        if (department.isEmpty()) {
            response.setMessage("Department Not Found");
            return response;
        }

        request.setUser(userEntity);
        request.setProduct(product.get());
        request.setDepartment(department.get());

        // Initial setup for Multi-Level Workflow Engine
        request.setStatus(RequestStatus.PENDING_FOR_APPROVAL);
        request.setCurrentApprovalLevel(1);
        request.setPaymentStatus("UNPAID");
        request.setCreatedDate(LocalDateTime.now());

        Request savedRequest = requestRepository.save(request);

        Optional<Admin> admin = adminRepository.findByDepartment_DepartmentId(savedRequest.getDepartment().getDepartmentId());
        if (admin.isPresent()) {
            mailService.sendRequestRaisedMail(admin.get().getEmail(), savedRequest);
        }

        double unitPrice = savedRequest.getProduct().getPricePerProduct() != null ? savedRequest.getProduct().getPricePerProduct() : 0.0;
        int qty = savedRequest.getQuantity() != null ? savedRequest.getQuantity() : 1;

        response.setMessage("Request Submitted Successfully (Level 1 Manager Review)");
        response.setRequestId(savedRequest.getRequestId());
        response.setProduct(savedRequest.getProduct().getName());
        response.setProductId(savedRequest.getProduct().getProductId());
        response.setQuantity(qty);
        response.setPricePerProduct(unitPrice);
        response.setEstimatedCost(unitPrice * qty);
        response.setStatus(savedRequest.getStatus().toString());
        response.setCurrentApprovalLevel(savedRequest.getCurrentApprovalLevel());
        response.setPaymentStatus(savedRequest.getPaymentStatus());
        response.setCreatedDate(savedRequest.getCreatedDate() != null ? savedRequest.getCreatedDate().toString() : "");

        return response;
    }

    // =========================================================
    // VIEW REQUESTS BY USER
    // =========================================================
    public List<RequestResponse> getRequestsByUser(Integer userId) {
        List<RequestResponse> responseList = new ArrayList<>();

        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return responseList;
        }

        List<Request> requests = requestRepository.findByUser(userOptional.get());

        for (Request request : requests) {
            RequestResponse response = new RequestResponse();
            response.setRequestId(request.getRequestId());

            if (request.getProduct() != null) {
                response.setProduct(request.getProduct().getName());
                response.setProductId(request.getProduct().getProductId());

                double unitPrice = request.getProduct().getPricePerProduct() != null ? request.getProduct().getPricePerProduct() : 0.0;
                int qty = request.getQuantity() != null ? request.getQuantity() : 0;
                response.setPricePerProduct(unitPrice);
                response.setEstimatedCost(unitPrice * qty);
            }

            if (request.getDepartment() != null) {
                response.setDepartment(request.getDepartment().getDepartmentName());
                response.setDepartmentId(request.getDepartment().getDepartmentId());
            }

            if (request.getUser() != null) {
                response.setUser(request.getUser().getName());
                response.setUserEmail(request.getUser().getEmail());
                response.setUserId(request.getUser().getUserId());
            }

            response.setQuantity(request.getQuantity());
            if (request.getStatus() != null) {
                response.setStatus(request.getStatus().toString());
            }
            response.setCurrentApprovalLevel(request.getCurrentApprovalLevel());
            response.setPaymentStatus(request.getPaymentStatus());
            response.setFeedback(request.getFeedback());
            response.setCreatedDate(request.getCreatedDate() != null ? request.getCreatedDate().toString() : "");

            // Populate Live Delivery & Fulfillment Details
            Optional<Delivery> delOpt = deliveryRepository.findByRequest_RequestId(request.getRequestId());
            if (delOpt.isPresent()) {
                Delivery d = delOpt.get();
                response.setDeliveryStatus(d.getStatus() != null ? d.getStatus() : "READY_FOR_FULFILLMENT");
                response.setCarrierName(d.getCarrierName());
                response.setTrackingNumber(d.getTrackingNumber());
                response.setRemarks(d.getRemarks());
                response.setDeliveryDate(d.getDeliveryDate() != null ? d.getDeliveryDate().toString() : "");
            } else if ("PAYMENT_SUCCESSFUL".equalsIgnoreCase(request.getPaymentStatus()) || "PAID".equalsIgnoreCase(request.getPaymentStatus())) {
                response.setDeliveryStatus("READY_FOR_FULFILLMENT");
            } else {
                response.setDeliveryStatus("PENDING");
            }

            responseList.add(response);
        }

        return responseList;
    }

    // =========================================================
    // VIEW PENDING REQUESTS
    // =========================================================
    public List<PendingRequestResponse> getPendingRequests() {
        List<PendingRequestResponse> responseList = new ArrayList<>();
        List<Request> requests = requestRepository.findByStatus(RequestStatus.PENDING_FOR_APPROVAL);

        for (Request request : requests) {
            PendingRequestResponse response = new PendingRequestResponse();
            response.setRequestId(request.getRequestId());

            if (request.getUser() != null) {
                response.setUser(request.getUser().getName());
                response.setUserEmail(request.getUser().getEmail());
            }

            if (request.getProduct() != null) {
                response.setProduct(request.getProduct().getName());
                response.setProductId(request.getProduct().getProductId());
                double price = request.getProduct().getPricePerProduct() != null ? request.getProduct().getPricePerProduct() : 0.0;
                int qty = request.getQuantity() != null ? request.getQuantity() : 0;
                response.setPricePerProduct(price);
                response.setTotalCost(price * qty);
            }

            if (request.getDepartment() != null) {
                response.setDepartment(request.getDepartment().getDepartmentName());
            }

            response.setQuantity(request.getQuantity());
            if (request.getStatus() != null) {
                response.setStatus(request.getStatus().toString());
            }
            response.setCurrentApprovalLevel(request.getCurrentApprovalLevel());
            response.setPaymentStatus(request.getPaymentStatus());
            response.setFeedback(request.getFeedback());
            response.setCreatedDate(request.getCreatedDate() != null ? request.getCreatedDate().toString() : "");

            responseList.add(response);
        }

        return responseList;
    }

    // =========================================================
    // VIEW ALL REQUESTS
    // =========================================================
    public List<PendingRequestResponse> getAllRequests() {
        List<PendingRequestResponse> responseList = new ArrayList<>();
        List<Request> requests = requestRepository.findAll();

        for (Request request : requests) {
            PendingRequestResponse response = new PendingRequestResponse();
            response.setRequestId(request.getRequestId());

            if (request.getUser() != null) {
                response.setUser(request.getUser().getName());
                response.setUserEmail(request.getUser().getEmail());
            }

            if (request.getProduct() != null) {
                response.setProduct(request.getProduct().getName());
                response.setProductId(request.getProduct().getProductId());
                double price = request.getProduct().getPricePerProduct() != null ? request.getProduct().getPricePerProduct() : 0.0;
                int qty = request.getQuantity() != null ? request.getQuantity() : 0;
                response.setPricePerProduct(price);
                response.setTotalCost(price * qty);
            }

            if (request.getDepartment() != null) {
                response.setDepartment(request.getDepartment().getDepartmentName());
            }

            response.setQuantity(request.getQuantity());
            if (request.getStatus() != null) {
                response.setStatus(request.getStatus().toString());
            }
            response.setCurrentApprovalLevel(request.getCurrentApprovalLevel());
            response.setPaymentStatus(request.getPaymentStatus());
            response.setFeedback(request.getFeedback());

            Optional<Delivery> delOpt = deliveryRepository.findByRequest_RequestId(request.getRequestId());
            if (delOpt.isPresent()) {
                Delivery d = delOpt.get();
                response.setDeliveryStatus(d.getStatus() != null ? d.getStatus() : "READY_FOR_FULFILLMENT");
                response.setCarrierName(d.getCarrierName());
                response.setTrackingNumber(d.getTrackingNumber());
                response.setRemarks(d.getRemarks());
            } else if ("PAYMENT_SUCCESSFUL".equalsIgnoreCase(request.getPaymentStatus()) || "PAID".equalsIgnoreCase(request.getPaymentStatus())) {
                response.setDeliveryStatus("READY_FOR_FULFILLMENT");
            } else {
                response.setDeliveryStatus("PENDING");
            }

            response.setCreatedDate(request.getCreatedDate() != null ? request.getCreatedDate().toString() : "");

            responseList.add(response);
        }

        return responseList;
    }

    // =========================================================
    // VIEW REQUEST BY ID
    // =========================================================
    public PendingRequestResponse getRequestById(Integer requestId) {
        Optional<Request> opt = requestRepository.findById(requestId);
        if (opt.isEmpty()) {
            throw new RuntimeException("Request Not Found with ID #" + requestId);
        }
        Request request = opt.get();
        PendingRequestResponse response = new PendingRequestResponse();
        response.setRequestId(request.getRequestId());

        if (request.getUser() != null) {
            response.setUser(request.getUser().getName());
            response.setUserEmail(request.getUser().getEmail());
        }

        if (request.getProduct() != null) {
            response.setProduct(request.getProduct().getName());
            response.setProductId(request.getProduct().getProductId());
            double price = request.getProduct().getPricePerProduct() != null ? request.getProduct().getPricePerProduct() : 0.0;
            int qty = request.getQuantity() != null ? request.getQuantity() : 0;
            response.setPricePerProduct(price);
            response.setTotalCost(price * qty);
        }

        if (request.getDepartment() != null) {
            response.setDepartment(request.getDepartment().getDepartmentName());
        }

        response.setQuantity(request.getQuantity());
        if (request.getStatus() != null) {
            response.setStatus(request.getStatus().toString());
        }
        response.setCurrentApprovalLevel(request.getCurrentApprovalLevel());
        response.setPaymentStatus(request.getPaymentStatus());
        response.setFeedback(request.getFeedback());

        Optional<Delivery> delOpt = deliveryRepository.findByRequest_RequestId(request.getRequestId());
        if (delOpt.isPresent()) {
            Delivery d = delOpt.get();
            response.setDeliveryStatus(d.getStatus() != null ? d.getStatus() : "READY_FOR_FULFILLMENT");
            response.setCarrierName(d.getCarrierName());
            response.setTrackingNumber(d.getTrackingNumber());
            response.setRemarks(d.getRemarks());
        } else if ("PAYMENT_SUCCESSFUL".equalsIgnoreCase(request.getPaymentStatus()) || "PAID".equalsIgnoreCase(request.getPaymentStatus())) {
            response.setDeliveryStatus("READY_FOR_FULFILLMENT");
        } else {
            response.setDeliveryStatus("PENDING");
        }

        response.setCreatedDate(request.getCreatedDate() != null ? request.getCreatedDate().toString() : "");

        return response;
    }

    // =========================================================
    // MULTI-LEVEL APPROVAL ENGINE (APPROVE / REJECT)
    // =========================================================
    public RequestActionResponse takeAction(RequestActionRequest actionRequest) {
        RequestActionResponse response = new RequestActionResponse();

        if (actionRequest == null || actionRequest.getRequestId() == null) {
            response.setMessage("Request ID is required");
            return response;
        }

        Optional<Request> requestOptional = requestRepository.findById(actionRequest.getRequestId());
        if (requestOptional.isEmpty()) {
            response.setMessage("Request Not Found");
            response.setRequestId(actionRequest.getRequestId());
            return response;
        }

        Request request = requestOptional.get();

        String action = actionRequest.getAction();
        if (action == null || action.trim().isEmpty()) {
            response.setMessage("Action is required. Use APPROVE or REJECT");
            response.setRequestId(request.getRequestId());
            response.setStatus(request.getStatus().toString());
            return response;
        }

        action = action.trim().toUpperCase();

        if (request.getStatus() != RequestStatus.PENDING_FOR_APPROVAL) {
            response.setMessage("Request has already completed processing");
            response.setRequestId(request.getRequestId());
            response.setStatus(request.getStatus().toString());
            return response;
        }

        request.setFeedback(actionRequest.getFeedback());

        // --- APPROVAL WORKFLOW FLOW ---
        if (action.equals("APPROVE")) {
            int currentLevel = request.getCurrentApprovalLevel() != null ? request.getCurrentApprovalLevel() : 1;

            if (currentLevel < 3) {
                // Promote to next stage (Level 1 Manager -> Level 2 Finance -> Level 3 Procurement)
                request.setCurrentApprovalLevel(currentLevel + 1);
                if (request.getFeedback() == null || request.getFeedback().trim().isEmpty()) {
                    request.setFeedback("Approved at Level " + currentLevel + ". Moving to Level " + (currentLevel + 1) + " review.");
                }
                response.setMessage("Level " + currentLevel + " Approval Successful. Advanced to Level " + (currentLevel + 1));
            } else {
                // Final Stage Passed (Level 3 Procurement Head Approved)
                request.setStatus(RequestStatus.APPROVED);
                // BUSINESS RULE: APPROVED requests must require payment by Admin
                request.setPaymentStatus("PAYMENT_REQUIRED");

                if (request.getFeedback() == null || request.getFeedback().trim().isEmpty()) {
                    request.setFeedback("Final Approval completed across all 3 levels. Purchase order awaiting Admin payment disbursal.");
                }

                if (request.getUser() != null && request.getUser().getEmail() != null) {
                    mailService.sendApprovalMail(request.getUser().getEmail(), request);
                }
                response.setMessage("Final Approval Granted! Order marked for Payment Disbursal (PAYMENT_REQUIRED).");
            }

            Request updatedRequest = requestRepository.save(request);

            response.setRequestId(updatedRequest.getRequestId());
            response.setStatus(updatedRequest.getStatus().toString());
            response.setFeedback(updatedRequest.getFeedback());
            return response;
        }

        // --- REJECTION FLOW ---
        if (action.equals("REJECT")) {
            request.setStatus(RequestStatus.REJECTED);
            request.setPaymentStatus("REJECTED");
            if (request.getFeedback() == null || request.getFeedback().trim().isEmpty()) {
                request.setFeedback("Request rejected during Stage " + request.getCurrentApprovalLevel() + " evaluation.");
            }

            Request updatedRequest = requestRepository.save(request);

            if (updatedRequest.getUser() != null && updatedRequest.getUser().getEmail() != null) {
                mailService.sendRejectionMail(updatedRequest.getUser().getEmail(), updatedRequest);
            }

            response.setMessage("Request Rejected at Stage " + updatedRequest.getCurrentApprovalLevel());
            response.setRequestId(updatedRequest.getRequestId());
            response.setStatus(updatedRequest.getStatus().toString());
            response.setFeedback(updatedRequest.getFeedback());
            return response;
        }

        return response;
    }

    // =========================================================
    // COMPATIBILITY API IMPLEMENTATIONS
    // =========================================================
    public ApprovalResponse approveRequest(Integer requestId) {
        RequestActionRequest actionRequest = new RequestActionRequest();
        actionRequest.setRequestId(requestId);
        actionRequest.setAction("APPROVE");

        RequestActionResponse res = takeAction(actionRequest);

        ApprovalResponse response = new ApprovalResponse();
        response.setMessage(res.getMessage());
        response.setRequestId(res.getRequestId());
        response.setStatus(res.getStatus());
        return response;
    }

    public RejectResponse rejectRequest(Integer requestId) {
        RequestActionRequest actionRequest = new RequestActionRequest();
        actionRequest.setRequestId(requestId);
        actionRequest.setAction("REJECT");

        RequestActionResponse res = takeAction(actionRequest);

        RejectResponse response = new RejectResponse();
        response.setMessage(res.getMessage());
        response.setRequestId(res.getRequestId());
        response.setStatus(res.getStatus());
        return response;
    }

    // =========================================================
    // DOWNLOAD REQUEST CSV
    // =========================================================
    public byte[] downloadRequestsCsv() {
        List<Request> requests = requestRepository.findAll();
        StringBuilder csv = new StringBuilder();

        csv.append("Request ID,User,Email,Product,Department,Quantity,Approval Level,Request Status,Payment Status,Delivery Status,Delivery Date,Rating,Feedback,Created Date\n");

        for (Request request : requests) {
            String userName = request.getUser() != null ? request.getUser().getName() : "";
            String userEmail = request.getUser() != null ? request.getUser().getEmail() : "";
            String productName = request.getProduct() != null ? request.getProduct().getName() : "";
            String departmentName = request.getDepartment() != null ? request.getDepartment().getDepartmentName() : "";
            String quantity = request.getQuantity() != null ? request.getQuantity().toString() : "";
            String approvalLevel = request.getCurrentApprovalLevel() != null ? "Level " + request.getCurrentApprovalLevel() : "Level 1";
            String requestStatus = request.getStatus() != null ? request.getStatus().toString() : "";
            String paymentStatus = request.getPaymentStatus() != null ? request.getPaymentStatus() : "UNPAID";

            String deliveryStatus = "";
            String deliveryDate = "";

            Optional<Delivery> deliveryOptional = deliveryRepository.findByRequest_RequestId(request.getRequestId());
            if (deliveryOptional.isPresent()) {
                Delivery delivery = deliveryOptional.get();
                deliveryStatus = delivery.getStatus() != null ? delivery.getStatus() : "";
                deliveryDate = delivery.getDeliveryDate() != null ? delivery.getDeliveryDate().toString() : "";
            }

            String rating = "";
            String feedback = request.getFeedback() != null ? request.getFeedback() : "";

            Optional<Feedback> feedbackOptional = feedbackRepository.findByRequest_RequestId(request.getRequestId());
            if (feedbackOptional.isPresent()) {
                Feedback feedbackEntity = feedbackOptional.get();
                rating = feedbackEntity.getRating() != null ? feedbackEntity.getRating().toString() : "";
                if (feedbackEntity.getComment() != null) {
                    feedback = feedbackEntity.getComment();
                }
            }

            String createdDate = request.getCreatedDate() != null ? request.getCreatedDate().toString() : "";

            csv.append(request.getRequestId()).append(",")
                    .append(escapeCsv(userName)).append(",")
                    .append(escapeCsv(userEmail)).append(",")
                    .append(escapeCsv(productName)).append(",")
                    .append(escapeCsv(departmentName)).append(",")
                    .append(escapeCsv(quantity)).append(",")
                    .append(escapeCsv(approvalLevel)).append(",")
                    .append(escapeCsv(requestStatus)).append(",")
                    .append(escapeCsv(paymentStatus)).append(",")
                    .append(escapeCsv(deliveryStatus)).append(",")
                    .append(escapeCsv(deliveryDate)).append(",")
                    .append(escapeCsv(rating)).append(",")
                    .append(escapeCsv(feedback)).append(",")
                    .append(escapeCsv(createdDate)).append("\n");
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }
}