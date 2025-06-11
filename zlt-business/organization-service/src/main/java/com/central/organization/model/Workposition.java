package com.central.organization.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
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
     * 岗位级别（1-高管，2-中层，3-基层等）
     */
    private Integer positionLevel;

    /**
     * 岗位描述
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
     * 最大员工数
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
     * 是否管理岗位
     */
    private Boolean isManager;

    /**
     * 是否主管岗位
     */
    private Boolean isDirector;

    /**
     * 排序序号
     */
    private Integer sortOrder;

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
    private Long createdBy;

    /**
     * 更新人ID
     */
    private Long updatedBy;
} 