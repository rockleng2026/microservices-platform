package com.central.soo.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.central.common.model.BaseEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.validation.constraints.DecimalMax;
import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 职级薪资标准表
 *
 * @author Portal Team
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("soo_job_level_salary")
@Schema(description = "职级薪资标准")
public class JobLevelSalary extends BaseEntity {
    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    @Schema(description = "主键ID")
    private Long id;

    @NotNull(message = "部门ID不能为空")
    @Schema(description = "部门ID", required = true)
    private Long departmentId;

    @NotNull(message = "基础工资下限不能为空")
    @Schema(description = "基础工资下限", required = true)
    private BigDecimal baseSalaryMin;

    @NotNull(message = "基础工资上限不能为空")
    @Schema(description = "基础工资上限", required = true)
    private BigDecimal baseSalaryMax;

    @NotNull(message = "绩效比例下限不能为空")
    @DecimalMin(value = "0.0000", message = "绩效比例下限不能小于0")
    @DecimalMax(value = "2.0000", message = "绩效比例下限不能大于2")
    @Schema(description = "绩效比例下限", required = true)
    private BigDecimal performanceRatioMin;

    @NotNull(message = "绩效比例上限不能为空")
    @DecimalMin(value = "0.0000", message = "绩效比例上限不能小于0")
    @DecimalMax(value = "2.0000", message = "绩效比例上限不能大于2")
    @Schema(description = "绩效比例上限", required = true)
    private BigDecimal performanceRatioMax;

    @NotNull(message = "生效日期不能为空")
    @Schema(description = "生效日期", required = true)
    private LocalDate effectiveDate;

    @Schema(description = "失效日期")
    private LocalDate expireDate;

    @Schema(description = "状态(1启用,0禁用)")
    private Integer status = 1;

    @Schema(description = "排序号")
    private Integer sortOrder;

    @Schema(description = "备注")
    private String remark;

    @TableLogic
    @Schema(description = "删除标识")
    private Integer delflag = 0;

    @Schema(description = "岗位ID-关联岗位表")
    private Long positionId;

    @Schema(description = "职级编码-编码定义在通用字典表")
    private String jobLevelCode;

    @Schema(description = "租户ID")
    private String tenantId;
} 