package com.central.soo.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.central.common.model.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.util.List;

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
     * 父级变量ID，支持树形结构
     */
    @TableField("parent_id")
    private Long parentId;

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
     * 约束条件公式
     */
    @TableField("constraint_formula")
    private String constraintFormula;

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

    // 非数据库字段 - 用于树形结构展示
    /**
     * 子变量列表
     */
    @TableField(exist = false)
    private List<ModelVariable> children;

    /**
     * 层级深度
     */
    @TableField(exist = false)
    private Integer level;

    /**
     * 是否为叶子节点
     */
    @TableField(exist = false)
    private Boolean isLeaf;

    /**
     * 父变量名称
     */
    @TableField(exist = false)
    private String parentName;

    /**
     * 子变量数量
     */
    @TableField(exist = false)
    private Integer childrenCount;

    // 变量类型常量
    public static final String TYPE_INPUT = "INPUT";
    public static final String TYPE_CALC = "CALC";
    public static final String TYPE_API = "API";
    public static final String TYPE_CALC_FACTORS = "CALC_FACTORS";

    // 数据类型常量
    public static final String DATA_TYPE_NUMBER = "NUMBER";
    public static final String DATA_TYPE_DECIMAL = "DECIMAL";
    public static final String DATA_TYPE_PERCENTAGE = "PERCENTAGE";
    public static final String DATA_TYPE_CURRENCY = "CURRENCY";
    public static final String DATA_TYPE_BOOLEAN = "BOOLEAN";
    public static final String DATA_TYPE_STRING = "STRING";

    /**
     * 判断是否为根节点
     */
    public boolean isRoot() {
        return parentId == null || parentId == 0;
    }

    /**
     * 判断是否为叶子节点
     */
    public boolean isLeafNode() {
        return children == null || children.isEmpty();
    }

    /**
     * 获取变量类型显示名称
     */
    public String getVariableTypeDisplayName() {
        switch (variableType) {
            case TYPE_INPUT:
                return "输入";
            case TYPE_CALC:
                return "计算";
            case TYPE_API:
                return "API";
            case TYPE_CALC_FACTORS:
                return "计算因子";
            default:
                return variableType;
        }
    }

    /**
     * 判断变量类型是否需要用户输入
     * INPUT和API类型不参与实例变量填写
     * CALC_FACTORS和CALC类型需要用户填写
     */
    public boolean isUserInputRequired() {
        return TYPE_CALC_FACTORS.equals(variableType) || TYPE_CALC.equals(variableType);
    }

    /**
     * 判断变量类型是否显示计算表达式
     * 只有CALC类型才显示计算表达式
     */
    public boolean shouldShowCalculationFormula() {
        return TYPE_CALC.equals(variableType);
    }

    /**
     * 判断变量类型是否显示约束表达式
     * 所有类型都显示约束表达式（如果存在）
     */
    public boolean shouldShowConstraintFormula() {
        return constraintFormula != null && !constraintFormula.trim().isEmpty();
    }

    /**
     * 获取数据类型显示名称
     */
    public String getDataTypeDisplayName() {
        switch (dataType) {
            case DATA_TYPE_NUMBER:
                return "数字";
            case DATA_TYPE_DECIMAL:
                return "小数";
            case DATA_TYPE_PERCENTAGE:
                return "百分比";
            case DATA_TYPE_CURRENCY:
                return "货币";
            case DATA_TYPE_BOOLEAN:
                return "布尔值";
            case DATA_TYPE_STRING:
                return "字符串";
            default:
                return dataType;
        }
    }
} 