package com.central.project.model;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.IdType;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.util.Date;

/**
 * 项目人员毛利分配实体类
 * 记录项目结项后的毛利分配给各参与人员
 * 
 * @author Central Team
 * @since 2024-12-25
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("project_profit_distribution")
public class ProjectProfitDistribution {
    
    /**
     * 主键
     */
    @TableId(type = IdType.AUTO)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    
    /**
     * 项目ID
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long projectId;
    
    /**
     * 产品毛利分配指导表ID
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long guideId;
    
    /**
     * 分配员工ID
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long employeeId;
    
    /**
     * 分配角色
     */
    private String role;
    
    /**
     * 分配形式（比例/金额）
     */
    private String distributionType;
    
    /**
     * 分配数值
     */
    private BigDecimal distributionValue;
    
    /**
     * 流程实例ID
     */
    private String processInstanceId;
    
    /**
     * 最终审批状态
     */
    private String finalStatus;
    
    /**
     * 租户ID
     */
    private String tenantId;
    
    /**
     * 创建人ID
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long createdBy;
    
    /**
     * 修改人ID
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long updatedBy;
    
    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date createdAt;
    
    /**
     * 修改时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date updatedAt;
    
    /**
     * 删除标识（0正常，1删除）
     */
    private Integer delflag;
    
    // =============== 扩展字段 ===============
    
    /**
     * 项目名称
     */
    @TableField(exist = false)
    private String projectName;
    
    /**
     * 员工姓名
     */
    @TableField(exist = false)
    private String employeeName;
    
    /**
     * 员工部门
     */
    @TableField(exist = false)
    private String departmentName;
    
    /**
     * 计算后的分配金额
     */
    @TableField(exist = false)
    private BigDecimal calculatedAmount;
} 