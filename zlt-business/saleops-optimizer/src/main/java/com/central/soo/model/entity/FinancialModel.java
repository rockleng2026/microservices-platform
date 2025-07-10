package com.central.soo.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.central.common.model.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 财务模型实体
 * 对应数据库表：soo_financial_model
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("soo_financial_model")
public class FinancialModel extends BaseEntity {

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 模型编码
     */
    @TableField("model_code")
    private String modelCode;

    /**
     * 模型名称
     */
    @TableField("model_name")
    private String modelName;

    /**
     * 模型版本
     */
    @TableField("model_version")
    private String modelVersion;

    /**
     * 模型分类
     */
    @TableField("model_category")
    private String modelCategory;

    /**
     * 模型描述
     */
    @TableField("model_description")
    private String modelDescription;

    /**
     * 父模型ID
     */
    @TableField("parent_model_id")
    private Long parentModelId;

    /**
     * 是否为模板
     */
    @TableField("is_template")
    private Boolean isTemplate;

    /**
     * 是否启用
     */
    @TableField("is_active")
    private Boolean isActive;

    /**
     * 模型配置
     */
    @TableField("model_config")
    private String modelConfig;

    /**
     * 验证规则
     */
    @TableField("validation_rules")
    private String validationRules;

    /**
     * 创建人ID
     */
    @TableField("creator_id")
    private Long creatorId;

    /**
     * 租户ID
     */
    @TableField("tenant_id")
    private String tenantId;

    // 常量定义
    public static final String CATEGORY_PROFIT_ANALYSIS = "PROFIT_ANALYSIS";
    public static final String CATEGORY_COST_ANALYSIS = "COST_ANALYSIS";
    public static final String CATEGORY_BREAKEVEN_ANALYSIS = "BREAKEVEN_ANALYSIS";
    public static final String CATEGORY_FORECAST_ANALYSIS = "FORECAST_ANALYSIS";
    public static final String CATEGORY_CUSTOM = "CUSTOM";

    public static final String DEFAULT_VERSION = "1.0.0";
} 