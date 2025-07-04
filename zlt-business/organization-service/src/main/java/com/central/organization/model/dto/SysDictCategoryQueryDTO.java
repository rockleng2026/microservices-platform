package com.central.organization.model.dto;

import lombok.Data;

/**
 * 通用字典类目查询DTO
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Data
public class SysDictCategoryQueryDTO {

    /**
     * 页码(从1开始)
     */
    private Integer page = 1;

    /**
     * 每页大小
     */
    private Integer size = 20;

    /**
     * 搜索关键字(类目名称或编码)
     */
    private String keyword;

    /**
     * 状态筛选(0=禁用, 1=启用)
     */
    private Integer status;

    /**
     * 租户ID
     */
    private String tenantId;
} 