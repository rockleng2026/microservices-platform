package com.central.project.model;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.IdType;
import com.central.project.utils.IdUtils.LongToString;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.util.Date;

/**
 * 项目结项实体类
 * 记录项目结项信息和毛利润
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("project_closure")
public class ProjectClosure {
    
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
     * 结项时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date closureTime;
    
    /**
     * 项目合同金额
     */
    private BigDecimal contractAmount;
    
    /**
     * 项目实际金额
     */
    private BigDecimal actualAmount;
    
    /**
     * 项目毛利润
     */
    private BigDecimal grossProfit;
    
    /**
     * 毛利率（%）
     */
    private BigDecimal grossProfitRate;
    
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
     * 删除标识
     */
    private Integer delflag;
    
    // =============== 扩展字段 ===============
    
    /**
     * 项目名称
     */
    @TableField(exist = false)
    private String projectName;
    
    /**
     * 项目负责人姓名
     */
    @TableField(exist = false)
    private String leaderName;
    
    /**
     * 审批状态显示文本
     */
    @TableField(exist = false)
    private String finalStatusText;
} 