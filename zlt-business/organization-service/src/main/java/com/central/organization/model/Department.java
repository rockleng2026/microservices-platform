package com.central.organization.model;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.IdType;
import com.central.organization.utils.IdUtils;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 部门实体类
 * 基于原department表结构，支持多租户和微服务
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("department")
public class Department {
    
    /**
     * 部门ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    @IdUtils.LongToString
    private Long id;
    
    /**
     * 部门名称
     */
    private String name;
    
    /**
     * 部门主管ID
     */
    @IdUtils.LongToString
    private Long directorId;
    
    /**
     * 父部门ID
     */
    @IdUtils.LongToString
    private Long parentId;
    
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
     * 租户ID
     */
    private String tenantId;
    
    /**
     * 创建人
     */
    @IdUtils.LongToString
    private Long createdBy;
    
    /**
     * 更新人
     */
    @IdUtils.LongToString
    private Long updatedBy;
    
    // 非数据库字段 - 用于树形结构展示
    
    /**
     * 子部门列表
     */
    @TableField(exist = false)
    private List<Department> children;
    
    /**
     * 部门主管姓名
     */
    @TableField(exist = false)
    private String directorName;
    
    /**
     * 父部门名称
     */
    @TableField(exist = false)
    private String parentName;
    
    /**
     * 部门层级深度
     */
    @TableField(exist = false)
    private Integer level;
    
    /**
     * 部门路径(从根部门到当前部门的完整路径)
     */
    @TableField(exist = false)
    private String departmentPath;
    
    /**
     * 员工总数
     */
    @TableField(exist = false)
    private Integer employeeCount;
    
    /**
     * 子部门数量
     */
    @TableField(exist = false)
    private Integer childrenCount;
    
    /**
     * 是否叶子节点
     */
    @TableField(exist = false)
    private Boolean isLeaf;
    
    /**
     * 是否展开(用于前端树形展示)
     */
    @TableField(exist = false)
    private Boolean expanded;
    
    /**
     * 是否半级部门
     */
    public Boolean isHalfLevel() {
        return this.islevel != null && this.islevel == 1;
    }
    
    /**
     * 是否分公司
     */
    public Boolean isFiliale() {
        return "1".equals(this.fiiale);
    }
    
    /**
     * 是否启用
     */
    public Boolean isEnabled() {
        return this.status != null && this.status == 1;
    }
    
    /**
     * 是否删除
     */
    public Boolean isDeleted() {
        return this.delflag != null && this.delflag == 1;
    }
} 