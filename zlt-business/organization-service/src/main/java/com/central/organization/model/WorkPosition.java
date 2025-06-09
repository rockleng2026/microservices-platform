package com.central.organization.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.central.common.model.SuperEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 岗位实体类
 * 基于原有workposition表结构扩展
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("workposition")
public class WorkPosition extends SuperEntity {

    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 岗位名称
     */
    private String name;

    /**
     * 岗位简写(兼容原字段)
     */
    private String shortname;

    /**
     * 岗位简写
     */
    private String shortName;

    /**
     * 所属部门ID(兼容原字段)
     */
    private Integer deptid;

    /**
     * 所属部门ID
     */
    private Integer departmentId;

    /**
     * 权重等级(1-5)(兼容原字段)
     */
    private Integer workgrade;

    /**
     * 岗位级别
     */
    private Integer positionLevel;

    /**
     * 工作职责(兼容原字段)
     */
    private String workcontent;

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
     * 功能权限ID串(兼容原字段)
     */
    @TableField("functionIDs")
    private String functionIds;

    /**
     * 权限配置JSON
     */
    private String permissions;

    /**
     * 上级岗位ID(兼容原字段)
     */
    private Integer parpostionid;

    /**
     * 上级岗位ID
     */
    private Integer parentPositionId;

    /**
     * 是否主管岗位(兼容原字段)
     */
    private Integer ispersonman;

    /**
     * 是否主管岗位(1是,0否)
     */
    private Integer isManager;

    /**
     * 是否领导岗位(1是,0否)
     */
    private Integer isDirector;

    /**
     * 排序号
     */
    private Integer sortOrder;

    /**
     * 状态(1启用,0禁用)
     */
    private Integer status;

    /**
     * 删除标识
     */
    private Integer delflag;

    /**
     * 最后编辑时间(兼容原字段)
     */
    private LocalDateTime edittime;

    /**
     * 租户ID
     */
    private String tenantId;

    /**
     * 创建人
     */
    private Integer createdBy;

    // 非数据库字段

    /**
     * 部门名称
     */
    @TableField(exist = false)
    private String departmentName;

    /**
     * 上级岗位名称
     */
    @TableField(exist = false)
    private String parentPositionName;

    /**
     * 当前任职人数
     */
    @TableField(exist = false)
    private Integer currentEmployees;

    /**
     * 岗位级别名称
     */
    @TableField(exist = false)
    private String levelName;

    /**
     * 岗位权重名称
     */
    @TableField(exist = false)
    private String workgradeName;

    /**
     * 分管部门列表
     */
    @TableField(exist = false)
    private List<Department> manageDepartments;

    /**
     * 岗位权限列表
     */
    @TableField(exist = false)
    private List<String> permissionList;

    /**
     * 任职员工列表
     */
    @TableField(exist = false)
    private List<Employee> employees;

    /**
     * 部门路径
     */
    @TableField(exist = false)
    private String deptPath;

    /**
     * 是否可配置权限
     */
    @TableField(exist = false)
    private Boolean canConfigPermission;

    /**
     * 权限配置对象
     */
    @TableField(exist = false)
    private Object permissionConfig;
} 