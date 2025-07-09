package com.central.soo.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 盈亏平衡配置实体
 * 对应数据库表：soo_breakeven_config
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("soo_breakeven_config")
public class BreakevenConfig {

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 配置项键
     */
    @TableField("config_key")
    private String configKey;

    /**
     * 配置项名称
     */
    @TableField("config_name")
    private String configName;

    /**
     * 配置分类
     */
    @TableField("config_category")
    private String configCategory;

    /**
     * 租户ID
     */
    @TableField("tenant_id")
    private String tenantId;

    /**
     * 配置值
     */
    @TableField("config_value")
    private String configValue;

    /**
     * 数值类型配置值
     */
    @TableField("numeric_value")
    private BigDecimal numericValue;

    /**
     * 布尔类型配置值
     */
    @TableField("boolean_value")
    private Boolean booleanValue;

    /**
     * JSON配置内容
     */
    @TableField("json_value")
    private String jsonValue;

    /**
     * 配置描述
     */
    @TableField("description")
    private String description;

    /**
     * 默认值
     */
    @TableField("default_value")
    private String defaultValue;

    /**
     * 值域/选项
     */
    @TableField("value_options")
    private String valueOptions;

    /**
     * 数据类型
     */
    @TableField("data_type")
    private String dataType;

    /**
     * 是否必填
     */
    @TableField("is_required")
    private Boolean isRequired;

    /**
     * 是否启用
     */
    @TableField("is_enabled")
    private Boolean isEnabled;

    /**
     * 是否系统级配置
     */
    @TableField("is_system")
    private Boolean isSystem;

    /**
     * 是否可编辑
     */
    @TableField("is_editable")
    private Boolean isEditable;

    /**
     * 显示顺序
     */
    @TableField("display_order")
    private Integer displayOrder;

    /**
     * 验证规则
     */
    @TableField("validation_rules")
    private String validationRules;

    /**
     * 格式化规则
     */
    @TableField("format_rules")
    private String formatRules;

    /**
     * 依赖条件
     */
    @TableField("dependencies")
    private String dependencies;

    /**
     * 影响范围
     */
    @TableField("impact_scope")
    private String impactScope;

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
     * 步长
     */
    @TableField("step_value")
    private BigDecimal stepValue;

    /**
     * 单位
     */
    @TableField("unit")
    private String unit;

    /**
     * 精度
     */
    @TableField("precision")
    private Integer precision;

    /**
     * 备注信息
     */
    @TableField("remarks")
    private String remarks;

    /**
     * 版本号
     */
    @TableField("version")
    private String version;

    /**
     * 生效时间
     */
    @TableField("effective_date")
    private LocalDateTime effectiveDate;

    /**
     * 失效时间
     */
    @TableField("expiry_date")
    private LocalDateTime expiryDate;

    /**
     * 创建人ID
     */
    @TableField("creator_id")
    private Long creatorId;

    /**
     * 最后修改人ID
     */
    @TableField("modifier_id")
    private Long modifierId;

    /**
     * 创建时间
     */
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    // 常量定义 - 配置分类
    public static final String CATEGORY_CALCULATION = "calculation";
    public static final String CATEGORY_FORECAST = "forecast";
    public static final String CATEGORY_SENSITIVITY = "sensitivity";
    public static final String CATEGORY_SCENARIO = "scenario";
    public static final String CATEGORY_DISPLAY = "display";
    public static final String CATEGORY_ALERT = "alert";
    public static final String CATEGORY_EXPORT = "export";
    public static final String CATEGORY_SYSTEM = "system";

    // 数据类型
    public static final String TYPE_STRING = "string";
    public static final String TYPE_NUMBER = "number";
    public static final String TYPE_BOOLEAN = "boolean";
    public static final String TYPE_JSON = "json";
    public static final String TYPE_DATE = "date";
    public static final String TYPE_ENUM = "enum";

    // 预定义配置项键值
    public static final String KEY_DEFAULT_ANALYSIS_PERIOD = "default_analysis_period";
    public static final String KEY_CONFIDENCE_LEVEL = "confidence_level";
    public static final String KEY_SENSITIVITY_RANGE = "sensitivity_range";
    public static final String KEY_FORECAST_HORIZON = "forecast_horizon";
    public static final String KEY_AUTO_RECALCULATION = "auto_recalculation";
    public static final String KEY_ALERT_THRESHOLDS = "alert_thresholds";
    public static final String KEY_DECIMAL_PLACES = "decimal_places";
    public static final String KEY_CURRENCY_SYMBOL = "currency_symbol";
    public static final String KEY_EXPORT_FORMAT = "export_format";
    public static final String KEY_CALCULATION_ENGINE_VERSION = "calculation_engine_version";
} 