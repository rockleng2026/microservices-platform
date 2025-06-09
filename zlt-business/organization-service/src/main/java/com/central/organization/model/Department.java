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
 * 部门实体类
 * 基于原有department表结构扩展
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("department")
public class Department extends SuperEntity {

    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 部门名称
     */
    private String name;

    /**
     * 部门主管ID
     */
    private Integer directorId;

    /**
     * 父部门ID
     */
    private Integer parentId;

    /**
     * 部门编号
     */
    private String depNo;

    /**
     * 部门等级(1-7级)
     */
    private Integer gradeid;

    /**
     * 部门级别
     */
    private Integer islevel;

    /**
     * 是否为分公司(1是,空否)
     */
    private String fiiale;

    /**
     * 分公司标识
     */
    private String filialemark;

    /**
     * 电话
     */
    private String tel;

    /**
     * 办公地址
     */
    private String address;

    /**
     * 部门描述
     */
    private String description;

    /**
     * 排序号
     */
    private Integer sortOrder;

    /**
     * 状态(1启用,0禁用)
     */
    private Integer status;

    /**
     * 删除标识(0正常,1删除)
     */
    private Integer delflag;

    /**
     * 创建时间(兼容原字段)
     */
    @TableField("Time")
    private LocalDateTime time;

    /**
     * 租户ID
     */
    private String tenantId;

    /**
     * 创建人
     */
    private Integer createdBy;

    /**
     * 更新人
     */
    private Integer updatedBy;

    // 非数据库字段
    
    /**
     * 部门主管姓名
     */
    @TableField(exist = false)
    private String directorName;

    /**
     * 部门等级名称
     */
    @TableField(exist = false)
    private String gradeName;

    /**
     * 父部门名称
     */
    @TableField(exist = false)
    private String parentName;

    /**
     * 部门路径
     */
    @TableField(exist = false)
    private String deptPath;

    /**
     * 子部门列表
     */
    @TableField(exist = false)
    private List<Department> children;

    /**
     * 员工数量
     */
    @TableField(exist = false)
    private Integer employeeCount;

    /**
     * 岗位数量
     */
    @TableField(exist = false)
    private Integer positionCount;

    /**
     * 是否为半级部门
     */
    @TableField(exist = false)
    private Boolean isHalfLevel;

    /**
     * 部门层级深度
     */
    @TableField(exist = false)
    private Integer level;

    /**
     * 是否有子部门
     */
    @TableField(exist = false)
    private Boolean hasChildren;
} 