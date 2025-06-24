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
import java.util.List;

/**
 * 项目实体类
 * 基于project表结构，支持多租户和微服务
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("project")
public class Project {
    
    /**
     * 项目ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    @LongToString
    private Long id;
    
    /**
     * 项目名称
     */
    private String name;
    
    /**
     * 项目类别（如党建、IDC、软件等）
     */
    private String category;
    
    /**
     * 参与人列表（JSON数组，存员工ID及角色）
     */
    private String participants;
    
    /**
     * 项目负责人ID
     */
    @LongToString
    private Long leaderId;
    
    /**
     * 项目客户名称
     */
    private String customerName;
    
    /**
     * 项目客户代表
     */
    private String customerContact;
    
    /**
     * 立项时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date startTime;
    
    /**
     * 项目状态（如init、running、closed等）
     */
    private String status;
    
    /**
     * 流程实例ID
     */
    private String processInstanceId;
    
    /**
     * 最终审批状态（如approved、rejected等）
     */
    private String finalStatus;
    
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
     * 项目负责人姓名
     */
    @TableField(exist = false)
    private String leaderName;
    
    /**
     * 项目参与人员详情
     */
    @TableField(exist = false)
    private List<ProjectDetail> participantDetails;
    
    /**
     * 项目结项信息
     */
    @TableField(exist = false)
    private ProjectClosure closure;
    
    /**
     * 项目状态显示文本
     */
    @TableField(exist = false)
    private String statusText;
    
    /**
     * 审批状态显示文本
     */
    @TableField(exist = false)
    private String finalStatusText;
} 