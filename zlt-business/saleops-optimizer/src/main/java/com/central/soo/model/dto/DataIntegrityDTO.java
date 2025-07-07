package com.central.soo.model.dto;

import lombok.Data;
import java.util.List;

/**
 * 数据完整性DTO
 */
@Data
public class DataIntegrityDTO {
    
    /**
     * 月份
     */
    private String month;
    
    /**
     * 总员工数
     */
    private Integer totalEmployees;
    
    /**
     * 有效员工数
     */
    private Integer validEmployees;
    
    /**
     * 缺失数据列表
     */
    private List<String> missingData;
    
    /**
     * 是否完整
     */
    private Boolean isComplete;
} 