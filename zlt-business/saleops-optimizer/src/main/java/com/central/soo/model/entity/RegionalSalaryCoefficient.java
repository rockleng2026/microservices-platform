package com.central.soo.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.central.common.model.BaseEntity;
import com.central.common.model.SuperEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 地区工资系数实体类
 *
 * @author zlt
 * @date 2024-01-01
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("soo_regional_salary_coefficient")
public class RegionalSalaryCoefficient extends BaseEntity {

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @NotNull(message = "地区不能为空")
    @Size(max = 50, message = "地区长度不能超过50个字符")
    private String region;

    @NotNull(message = "地区编码不能为空")
    @Size(max = 20, message = "地区编码长度不能超过20个字符")
    private String regionCode;

    @NotNull(message = "工资系数不能为空")
    @DecimalMin(value = "0.0001", message = "工资系数必须大于0")
    @DecimalMax(value = "9.9999", message = "工资系数不能超过9.9999")
    @Digits(integer = 1, fraction = 4, message = "工资系数最多1位整数，4位小数")
    private BigDecimal salaryCoefficient;

    @DecimalMin(value = "0.0001", message = "生活成本指数必须大于0")
    @DecimalMax(value = "9.9999", message = "生活成本指数不能超过9.9999")
    @Digits(integer = 1, fraction = 4, message = "生活成本指数最多1位整数，4位小数")
    private BigDecimal costOfLivingIndex;

    @NotNull(message = "生效日期不能为空")
    private LocalDate effectiveDate;

    private LocalDate expireDate;

    @Min(value = 0, message = "状态值无效")
    @Max(value = 1, message = "状态值无效")
    private Integer status;

    @Min(value = 0, message = "排序号不能为负数")
    private Integer sortOrder;

    @Size(max = 500, message = "备注长度不能超过500个字符")
    private String remark;
} 