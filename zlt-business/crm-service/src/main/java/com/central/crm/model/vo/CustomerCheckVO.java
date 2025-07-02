package com.central.crm.model.vo;

import lombok.Data;

@Data
public class CustomerCheckVO {
    private String customerName;
    private String phone;
    private String email;
    private Long customerId; // 排除的客户ID，用于编辑时验证
} 