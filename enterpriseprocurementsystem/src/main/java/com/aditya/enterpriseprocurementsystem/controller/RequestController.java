package com.aditya.enterpriseprocurementsystem.controller;

import com.aditya.enterpriseprocurementsystem.dto.ApprovalResponse;
import com.aditya.enterpriseprocurementsystem.dto.PendingRequestResponse;
import com.aditya.enterpriseprocurementsystem.dto.RejectResponse;
import com.aditya.enterpriseprocurementsystem.dto.RequestActionRequest;
import com.aditya.enterpriseprocurementsystem.dto.RequestResponse;
import com.aditya.enterpriseprocurementsystem.entity.Request;
import com.aditya.enterpriseprocurementsystem.service.RequestService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/request")
public class RequestController {

    @Autowired
    private RequestService requestService;


    // =========================================================
    // CREATE REQUEST
    // =========================================================

    @PostMapping("/create")
    public RequestResponse createRequest(
            @Valid @RequestBody Request request) {

        return requestService.createRequest(request);
    }


    // =========================================================
    // VIEW PENDING REQUESTS
    // =========================================================

    @GetMapping("/pending")
    public List<PendingRequestResponse> getPendingRequests() {

        return requestService.getPendingRequests();
    }
    // =========================================================
    // VIEW USER REQUESTS
    // =========================================================

    @GetMapping("/user/{userId}")
    public List<RequestResponse> getRequestsByUser(
            @PathVariable Integer userId) {

        return requestService.getRequestsByUser(userId);
    }


    // =========================================================
    // VIEW ALL REQUESTS
    // =========================================================

    @GetMapping("/all")
    public List<PendingRequestResponse> getAllRequests() {
        return requestService.getAllRequests();
    }


    // =========================================================
    // VIEW SINGLE REQUEST BY ID
    // =========================================================

    @GetMapping("/{requestId}")
    public PendingRequestResponse getRequestById(@PathVariable Integer requestId) {
        return requestService.getRequestById(requestId);
    }


    // =========================================================
    // APPROVE REQUEST
    // OLD API - KEEPING FOR COMPATIBILITY
    // =========================================================

    @PutMapping("/approve/{requestId}")
    public ApprovalResponse approveRequest(
            @PathVariable Integer requestId) {

        return requestService.approveRequest(requestId);
    }


    // =========================================================
    // REJECT REQUEST
    // OLD API - KEEPING FOR COMPATIBILITY
    // =========================================================

    @PutMapping("/reject/{requestId}")
    public RejectResponse rejectRequest(
            @PathVariable Integer requestId) {

        return requestService.rejectRequest(requestId);
    }


    // =========================================================
    // APPROVE / REJECT ACTION
    // NEW API
    // =========================================================

    @PostMapping("/action")
    public Object takeAction(
            @RequestBody RequestActionRequest request) {

        return requestService.takeAction(request);
    }


    // =========================================================
    // DOWNLOAD REQUEST CSV
    // =========================================================

    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadRequestsCsv() {

        byte[] csvBytes =
                requestService.downloadRequestsCsv();

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=requests.csv"
                )
                .contentType(
                        MediaType.parseMediaType("text/csv")
                )
                .body(csvBytes);
    }
}