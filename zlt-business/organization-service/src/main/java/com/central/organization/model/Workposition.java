package com.central.organization.model;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 工作岗位表
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("workposition")
public class Workposition implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

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
    private Long departmentId;

    /**
     * 岗位级别（1-5级别）
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

    /**
     * 删除标识(0正常,1删除)
     */
    @TableLogic
    private Integer delflag;

    /**
     * 租户ID
     */
    private String tenantId;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    /**
     * 创建人ID
     */
    @TableField(fill = FieldFill.INSERT)
    private Long createdBy;

    /**
     * 更新人ID
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updatedBy;

    /**
     * 部门名称（关联查询字段，不存储到数据库）
     */
    @TableField(exist = false)
    private String deptName;
} 