package com.central.organization.model.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 岗位视图对象
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = false)
public class WorkpositionVO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    private String id;

    /**
     * 岗位名称
     */
    private String name;

    /**
     * 岗位简称
     */
    private String shortName;

    /**
     * 所属部门ID
     */
    private String departmentId;

    /**
     * 所属部门名称
     */
    private String departmentName;

    /**
     * 部门路径
     */
    private String departmentPath;

    /**
     * 岗位级别
     */
    private Integer positionLevel;

    /**
     * 岗位级别名称
     */
    private String positionLevelName;

    /**
     * 岗位职责描述
     */
    private String jobDescription;

    /**
     * 任职要求
     */
    private String requirements;

    /**
     * 薪资范围
     */
    private String salaryRange;

    /**
     * 最大任职人数
     */
    private Integer maxEmployees;

    /**
     * 当前任职人数
     */
    private Integer currentEmployees;

    /**
     * 菜单权限ID列表（逗号分隔）
     */
    private String menuIds;

    /**
     * 菜单功能权限ID列表（逗号分隔）
     */
    private String menuFuncIds;

    /**
     * 是否管理岗位（1是,0否）
     */
    private Integer isManager;

    /**
     * 是否主管岗位（1是,0否）
     */
    private Integer isDirector;

    /**
     * 排序序号
     */
    private Integer sortOrder;

    /**
     * 状态(1启用,0禁用)
     */
    private Integer status;

    /**
     * 状态描述
     */
    private String statusDesc;

    /**
     * 租户ID
     */
    private String tenantId;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    /**
     * 创建人ID
     */
    private String createdBy;

    /**
     * 创建人姓名
     */
    private String createdByName;

    /**
     * 更新人ID
     */
    private String updatedBy;

    /**
     * 更新人姓名
     */
    private String updatedByName;
} 