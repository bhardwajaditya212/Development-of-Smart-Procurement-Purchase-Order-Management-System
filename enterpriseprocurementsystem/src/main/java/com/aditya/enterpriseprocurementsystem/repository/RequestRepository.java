package com.aditya.enterpriseprocurementsystem.repository;

import com.aditya.enterpriseprocurementsystem.entity.Department;
import com.aditya.enterpriseprocurementsystem.entity.Request;
import com.aditya.enterpriseprocurementsystem.entity.User;
import com.aditya.enterpriseprocurementsystem.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RequestRepository extends JpaRepository<Request, Integer> {

    List<Request> findByUser(User user);

    List<Request> findByDepartment(Department department);

    List<Request> findByStatus(RequestStatus status);

    List<Request> findByDepartmentAndStatus(
            Department department,
            RequestStatus status
    );
}
