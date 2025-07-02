package com.central.crm.model.vo;

import com.central.crm.model.Customer;

/**
 * 客户VO - 扩展客户信息，包含关联的员工信息
 *
 * @author Central Team
 * @since 2024-12-19
 */
public class CustomerVO extends Customer {
    
    private String ownerEmployeeName;
    private String ownerDepartmentName;
    
    public String getOwnerEmployeeName() {
        return ownerEmployeeName;
    }
    
    public void setOwnerEmployeeName(String ownerEmployeeName) {
        this.ownerEmployeeName = ownerEmployeeName;
    }
    
    public String getOwnerDepartmentName() {
        return ownerDepartmentName;
    }
    
    public void setOwnerDepartmentName(String ownerDepartmentName) {
        this.ownerDepartmentName = ownerDepartmentName;
    }
} 