package com.central.project.model.dto;

import lombok.Data;

/**
 * 项目查询DTO
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Data
public class ProjectQueryDTO {
    
    /**
     * 页码
     */
    private Integer page = 1;
    
    /**
     * 每页大小
     */
    private Integer size = 10;
    
    /**
     * 项目名称（模糊查询）
     */
    private String name;
    
    /**
     * 项目类别
     */
    private String category;
    
    /**
     * 项目状态
     */
    private String status;
    
    /**
     * 项目负责人ID
     */
    private Long leaderId;
    
    /**
     * 客户名称（模糊查询）
     */
    private String customerName;
    
    /**
     * 开始时间（开始范围）
     */
    private String startTimeBegin;
    
    /**
     * 开始时间（结束范围）
     */
    private String startTimeEnd;
    
    /**
     * 创建时间（开始范围）
     */
    private String createdAtBegin;
    
    /**
     * 创建时间（结束范围）
     */
    private String createdAtEnd;
    
    /**
     * 搜索关键字（项目名称或客户名称）
     */
    private String keyword;
    
    /**
     * 参与人ID
     */
    private Long participantId;
    
    /**
     * 最终审批状态
     */
    private String finalStatus;
    
    /**
     * 排序字段
     */
    private String orderBy = "created_at";
    
    /**
     * 排序方向（asc/desc）
     */
    private String orderDirection = "desc";
} 