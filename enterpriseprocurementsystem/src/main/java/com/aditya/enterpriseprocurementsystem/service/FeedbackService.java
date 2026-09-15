package com.aditya.enterpriseprocurementsystem.service;

import com.aditya.enterpriseprocurementsystem.dto.FeedbackRequest;
import com.aditya.enterpriseprocurementsystem.dto.FeedbackResponse;
import com.aditya.enterpriseprocurementsystem.entity.Delivery;
import com.aditya.enterpriseprocurementsystem.entity.Feedback;
import com.aditya.enterpriseprocurementsystem.entity.Request;
import com.aditya.enterpriseprocurementsystem.repository.DeliveryRepository;
import com.aditya.enterpriseprocurementsystem.repository.FeedbackRepository;
import com.aditya.enterpriseprocurementsystem.repository.RequestRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final RequestRepository requestRepository;
    private final DeliveryRepository deliveryRepository;

    public FeedbackService(
            FeedbackRepository feedbackRepository,
            RequestRepository requestRepository,
            DeliveryRepository deliveryRepository) {

        this.feedbackRepository = feedbackRepository;
        this.requestRepository = requestRepository;
        this.deliveryRepository = deliveryRepository;
    }


    // =====================================================
    // SUBMIT OR UPDATE FEEDBACK
    // =====================================================

    public FeedbackResponse submitFeedback(
            FeedbackRequest feedbackRequest) {

        FeedbackResponse response = new FeedbackResponse();

        if (feedbackRequest == null || feedbackRequest.getRequestId() == null) {
            response.setMessage("Request ID is required");
            return response;
        }

        Integer requestId = feedbackRequest.getRequestId();

        Optional<Request> requestOptional = requestRepository.findById(requestId);
        if (requestOptional.isEmpty()) {
            response.setMessage("Request Not Found");
            response.setRequestId(requestId);
            return response;
        }

        Request request = requestOptional.get();

        // Ensure Delivery record exists and is DELIVERED
        Optional<Delivery> deliveryOptional = deliveryRepository.findByRequest_RequestId(requestId);
        if (deliveryOptional.isEmpty()) {
            Delivery newDelivery = new Delivery();
            newDelivery.setRequest(request);
            newDelivery.setStatus("DELIVERED");
            newDelivery.setDeliveryDate(LocalDateTime.now());
            deliveryRepository.save(newDelivery);
        } else {
            Delivery delivery = deliveryOptional.get();
            if (delivery.getStatus() == null || !delivery.getStatus().equalsIgnoreCase("DELIVERED")) {
                delivery.setStatus("DELIVERED");
                delivery.setDeliveryDate(LocalDateTime.now());
                deliveryRepository.save(delivery);
            }
        }

        // Calculate / fallback rating
        Integer rating = feedbackRequest.getRating();
        Integer supplierRating = feedbackRequest.getSupplierRating();
        Integer productQualityRating = feedbackRequest.getProductQualityRating();
        Integer deliveryRating = feedbackRequest.getDeliveryRating();

        if (rating == null) {
            if (supplierRating != null || productQualityRating != null || deliveryRating != null) {
                int s = supplierRating != null ? supplierRating : 5;
                int p = productQualityRating != null ? productQualityRating : 5;
                int d = deliveryRating != null ? deliveryRating : 5;
                rating = Math.round((s + p + d) / 3.0f);
            } else {
                rating = 5;
            }
        }

        if (rating < 1) rating = 1;
        if (rating > 5) rating = 5;

        String comment = feedbackRequest.getComment();
        if (comment == null || comment.trim().isEmpty()) {
            comment = feedbackRequest.getComments();
        }
        if (comment == null || comment.trim().isEmpty()) {
            comment = "Excellent quality and timely delivery fulfillment.";
        }

        // Check if existing feedback exists (Update if exists, Create if new)
        Optional<Feedback> existingFeedback = feedbackRepository.findByRequest_RequestId(requestId);
        Feedback feedback;
        if (existingFeedback.isPresent()) {
            feedback = existingFeedback.get();
            feedback.setRating(rating);
            feedback.setSupplierRating(supplierRating != null ? supplierRating : rating);
            feedback.setProductQualityRating(productQualityRating != null ? productQualityRating : rating);
            feedback.setDeliveryRating(deliveryRating != null ? deliveryRating : rating);
            feedback.setComment(comment);
            feedback.setCreatedDate(LocalDateTime.now());
        } else {
            feedback = new Feedback();
            feedback.setRequest(request);
            feedback.setRating(rating);
            feedback.setSupplierRating(supplierRating != null ? supplierRating : rating);
            feedback.setProductQualityRating(productQualityRating != null ? productQualityRating : rating);
            feedback.setDeliveryRating(deliveryRating != null ? deliveryRating : rating);
            feedback.setComment(comment);
            feedback.setCreatedDate(LocalDateTime.now());
        }

        Feedback savedFeedback = feedbackRepository.save(feedback);

        // Keep request comments synced
        request.setFeedback(comment);
        requestRepository.save(request);

        return mapToFeedbackResponse(savedFeedback, "Feedback recorded into system ledger successfully!");
    }


    // =====================================================
    // GET FEEDBACK BY REQUEST ID
    // =====================================================

    public FeedbackResponse getFeedback(Integer requestId) {
        Optional<Feedback> feedbackOptional = feedbackRepository.findByRequest_RequestId(requestId);
        if (feedbackOptional.isEmpty()) {
            FeedbackResponse response = new FeedbackResponse();
            response.setMessage("Feedback Not Found");
            response.setRequestId(requestId);
            return response;
        }

        return mapToFeedbackResponse(feedbackOptional.get(), "Feedback Found");
    }


    // =====================================================
    // GET ALL FEEDBACKS (FOR ADMIN & SUPPLIER PORTAL)
    // =====================================================

    public List<FeedbackResponse> getAllFeedbacks() {
        List<Feedback> allFeedbacks = feedbackRepository.findAll();
        if (allFeedbacks.isEmpty()) {
            return new ArrayList<>();
        }

        return allFeedbacks.stream()
                .sorted((a, b) -> {
                    LocalDateTime da = a.getCreatedDate() != null ? a.getCreatedDate() : LocalDateTime.MIN;
                    LocalDateTime db = b.getCreatedDate() != null ? b.getCreatedDate() : LocalDateTime.MIN;
                    return db.compareTo(da);
                })
                .map(f -> mapToFeedbackResponse(f, "Feedback Retrieved"))
                .collect(Collectors.toList());
    }


    // =====================================================
    // HELPER: MAP TO RICH FEEDBACK RESPONSE DTO
    // =====================================================

    private FeedbackResponse mapToFeedbackResponse(Feedback feedback, String message) {
        FeedbackResponse res = new FeedbackResponse();
        res.setMessage(message);
        res.setFeedbackId(feedback.getFeedbackId());
        res.setRating(feedback.getRating());
        res.setSupplierRating(feedback.getSupplierRating() != null ? feedback.getSupplierRating() : feedback.getRating());
        res.setProductQualityRating(feedback.getProductQualityRating() != null ? feedback.getProductQualityRating() : feedback.getRating());
        res.setDeliveryRating(feedback.getDeliveryRating() != null ? feedback.getDeliveryRating() : feedback.getRating());
        res.setComment(feedback.getComment());
        res.setCreatedDate(feedback.getCreatedDate());

        Request request = feedback.getRequest();
        if (request != null) {
            res.setRequestId(request.getRequestId());
            res.setPoNumber(String.format("PO-%04d", request.getRequestId()));

            if (request.getProduct() != null) {
                res.setProductName(request.getProduct().getName());
                Double unitPrice = request.getProduct().getPricePerProduct() != null ? request.getProduct().getPricePerProduct() : 0.0;
                int qty = request.getQuantity() != null ? request.getQuantity() : 1;
                res.setQuantity(qty);
                res.setTotalAmount(unitPrice * qty);
            } else {
                res.setProductName("Procurement Goods");
                res.setQuantity(request.getQuantity() != null ? request.getQuantity() : 1);
                res.setTotalAmount(0.0);
            }

            if (request.getUser() != null) {
                res.setUserName(request.getUser().getName());
                res.setUserEmail(request.getUser().getEmail());
            } else {
                res.setUserName("Employee Requester");
                res.setUserEmail("user@enterprise.com");
            }

            if (request.getDepartment() != null) {
                res.setDepartmentName(request.getDepartment().getDepartmentName());
            } else {
                res.setDepartmentName("Operations");
            }

            res.setDeliveryStatus("DELIVERED");
        }

        return res;
    }
}