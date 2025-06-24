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
 * 产品毛利分配指导表实体类
 * 记录不同产品类型和角色的提成分配指导
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("product_profit_distribution_guide")
public class ProductProfitDistributionGuide {
    
    /**
     * 主键
     */
    @TableId(type = IdType.ASSIGN_ID)
    @LongToString
    private Long id;
    
    /**
     * 产品名称（如党建项目、IDC项目等）
     */
    private String productName;
    
    /**
     * 参与角色（如销售、技术、产品经理等）
     */
    private String role;
    
    /**
     * 提成类型（比例/金额）
     */
    private String commissionType;
    
    /**
     * 数值范围（如1-5、500~10000）
     */
    private String valueRange;
    
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
     * 最小值
     */
    @TableField(exist = false)
    private String minValue;
    
    /**
     * 最大值
     */
    @TableField(exist = false)
    private String maxValue;
    
    /**
     * 提成类型显示文本
     */
    @TableField(exist = false)
    private String commissionTypeText;
} 