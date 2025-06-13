package com.central.organization.model.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;

/**
 * 岗位保存/更新DTO
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = false)
public class WorkpositionSaveDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID（更新时必填）
     */
    private Long id;

    /**
     * 岗位名称
     */
    @NotBlank(message = "岗位名称不能为空")
    private String name;

    /**
     * 岗位简称
     */
    private String shortName;

    /**
     * 所属部门ID
     */
    @NotNull(message = "所属部门不能为空")
    private Long departmentId;

    /**
     * 岗位级别
     */
    private Integer positionLevel;

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
} 