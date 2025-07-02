package com.central.crm.model.vo;

import lombok.Data;
import java.util.List;

@Data
public class CustomerBatchStatusVO {
    private List<Long> customerIds;
    private String status;
    private Long updatedBy;
}
