package com.central.project.model.dto;

import lombok.Data;

/**
 * 产品毛利分配指导查询DTO
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Data
public class ProductProfitDistributionGuideQueryDTO {
    
    /**
     * 页码
     */
    private Integer page = 1;
    
    /**
     * 每页大小
     */
    private Integer size = 10;
    
    /**
     * 产品名称（模糊查询）
     */
    private String productName;
    
    /**
     * 参与角色
     */
    private String role;
    
    /**
     * 提成类型
     */
    private String commissionType;
    
    /**
     * 搜索关键字（产品名称或角色）
     */
    private String keyword;
    
    /**
     * 创建时间（开始范围）
     */
    private String createdAtBegin;
    
    /**
     * 创建时间（结束范围）
     */
    private String createdAtEnd;
    
    /**
     * 排序字段
     */
    private String orderBy = "created_at";
    
    /**
     * 排序方向（asc/desc）
     */
    private String orderDirection = "desc";
} 