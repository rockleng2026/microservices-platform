package com.central.crm.model.vo;

import lombok.Data;

@Data
public class CustomerQueryVO {
    private Integer page = 1;
    private Integer size = 20;
    private String customerName;
    private String customerType;
    private String customerStatus;
    private String customerSource;
    private Long ownerEmployeeId;
    private String industry;
    private String companyScale;
    private String startDate;
    private String endDate;
}
