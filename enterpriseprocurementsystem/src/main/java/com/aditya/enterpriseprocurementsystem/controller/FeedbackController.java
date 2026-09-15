package com.aditya.enterpriseprocurementsystem.controller;

import com.aditya.enterpriseprocurementsystem.dto.FeedbackRequest;
import com.aditya.enterpriseprocurementsystem.dto.FeedbackResponse;
import com.aditya.enterpriseprocurementsystem.service.FeedbackService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/feedback")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;


    // =====================================================
    // SUBMIT FEEDBACK
    // =====================================================

    @PostMapping("/submit")
    public FeedbackResponse submitFeedback(
            @RequestBody FeedbackRequest request) {

        return feedbackService.submitFeedback(request);
    }


    // =====================================================
    // GET FEEDBACK BY ID
    // =====================================================

    @GetMapping("/{requestId}")
    public FeedbackResponse getFeedback(
            @PathVariable Integer requestId) {

        return feedbackService.getFeedback(requestId);
    }


    // =====================================================
    // GET ALL FEEDBACKS (FOR ADMIN & SUPPLIER SCORECARDS)
    // =====================================================

    @GetMapping("/all")
    public List<FeedbackResponse> getAllFeedbacks() {
        return feedbackService.getAllFeedbacks();
    }
}