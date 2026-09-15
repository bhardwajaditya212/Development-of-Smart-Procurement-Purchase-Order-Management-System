package com.aditya.enterpriseprocurementsystem.repository;

import com.aditya.enterpriseprocurementsystem.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FeedbackRepository
        extends JpaRepository<Feedback, Integer> {

    Optional<Feedback> findByRequest_RequestId(Integer requestId);
}