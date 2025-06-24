package com.central.project.model;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.IdType;
import com.central.project.utils.IdUtils.LongToString;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Date;

/**
 * 项目明细实体类
 * 记录项目参与人及角色
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("project_detail")
public class ProjectDetail {
    
    /**
     * 主键
     */
    @TableId(type = IdType.ASSIGN_ID)
    @LongToString
    private Long id;
    
    /**
     * 项目ID
     */
    @LongToString
    private Long projectId;
    
    /**
     * 参与人ID（员工ID）
     */
    @LongToString
    private Long participantId;
    
    /**
     * 项目角色
     */
    private String role;
    
    /**
     * 租户ID
     */
    private String tenantId;
    
    /**
     * 创建人ID
     */
    @LongToString
    private Long createdBy;
    
    /**
     * 修改人ID
     */
    @LongToString
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
     * 参与人姓名
     */
    @TableField(exist = false)
    private String participantName;
    
    /**
     * 参与人部门
     */
    @TableField(exist = false)
    private String departmentName;
    
    /**
     * 项目名称
     */
    @TableField(exist = false)
    private String projectName;
} 