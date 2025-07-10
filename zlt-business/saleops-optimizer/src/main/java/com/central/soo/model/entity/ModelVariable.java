package com.central.soo.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.central.common.model.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 模型变量实体
 * 对应数据库表：soo_model_variable
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("soo_model_variable")
public class ModelVariable extends BaseEntity {

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 模型ID
     */
    @TableField("model_id")
    private Long modelId;

    /**
     * 变量编码
     */
    @TableField("variable_code")
    private String variableCode;

    /**
     * 变量名称
     */
    @TableField("variable_name")
    private String variableName;

    /**
     * 变量类型：INPUT/CALC/API
     */
    @TableField("variable_type")
    private String variableType;

    /**
     * 数据类型：NUMBER/DECIMAL/PERCENTAGE/CURRENCY/BOOLEAN/STRING
     */
    @TableField("data_type")
    private String dataType;

    /**
     * 单位
     */
    @TableField("unit")
    private String unit;

    /**
     * 默认值
     */
    @TableField("default_value")
    private BigDecimal defaultValue;

    /**
     * 最小值
     */
    @TableField("min_value")
    private BigDecimal minValue;

    /**
     * 最大值
     */
    @TableField("max_value")
    private BigDecimal maxValue;

    /**
     * 计算公式
     */
    @TableField("calculation_formula")
    private String calculationFormula;

    /**
     * API配置
     */
    @TableField("api_config")
    private String apiConfig;

    /**
     * 显示顺序
     */
    @TableField("display_order")
    private Integer displayOrder;

    /**
     * 是否必填
     */
    @TableField("is_required")
    private Boolean isRequired;

    /**
     * 是否关键指标
     */
    @TableField("is_key_indicator")
    private Boolean isKeyIndicator;

    /**
     * 是否显示
     */
    @TableField("is_visible")
    private Boolean isVisible;

    /**
     * 验证规则
     */
    @TableField("validation_rules")
    private String validationRules;

    /**
     * 变量描述
     */
    @TableField("description")
    private String description;

    /**
     * 帮助说明
     */
    @TableField("help_text")
    private String helpText;

    // 变量类型常量
    public static final String TYPE_INPUT = "INPUT";
    public static final String TYPE_CALC = "CALC";
    public static final String TYPE_API = "API";

    // 数据类型常量
    public static final String DATA_TYPE_NUMBER = "NUMBER";
    public static final String DATA_TYPE_DECIMAL = "DECIMAL";
    public static final String DATA_TYPE_PERCENTAGE = "PERCENTAGE";
    public static final String DATA_TYPE_CURRENCY = "CURRENCY";
    public static final String DATA_TYPE_BOOLEAN = "BOOLEAN";
    public static final String DATA_TYPE_STRING = "STRING";
} 