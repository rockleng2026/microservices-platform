package com.central.organization.model.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;

/**
 * 岗位查询DTO
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = false)
public class WorkpositionQueryDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 岗位名称（模糊查询）
     */
    private String name;

    /**
     * 岗位简称（模糊查询）
     */
    private String shortName;

    /**
     * 所属部门ID
     */
    private Long departmentId;

    /**
     * 岗位级别
     */
    private Integer positionLevel;

    /**
     * 是否管理岗位
     */
    private Integer isManager;

    /**
     * 是否主管岗位
     */
    private Integer isDirector;

    /**
     * 状态(1启用,0禁用)
     */
    private Integer status;

    /**
     * 关键词（名称、简称模糊查询）
     */
    private String keyword;

    /**
     * 当前页码
     */
    private Integer current = 1;

    /**
     * 每页大小
     */
    private Integer size = 20;

    /**
     * 排序字段
     */
    private String sortField;

    /**
     * 排序方向（asc/desc）
     */
    private String sortOrder;
} 