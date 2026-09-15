package com.aditya.enterpriseprocurementsystem.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "approval_hierarchy")
public class ApprovalHierarchy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "approval_hierarchy_id")
    private Integer approvalHierarchyId;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(name = "level")
    private Integer level;

    public ApprovalHierarchy() {
    }

    public Integer getApprovalHierarchyId() {
        return approvalHierarchyId;
    }

    public void setApprovalHierarchyId(Integer approvalHierarchyId) {
        this.approvalHierarchyId = approvalHierarchyId;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }
}
