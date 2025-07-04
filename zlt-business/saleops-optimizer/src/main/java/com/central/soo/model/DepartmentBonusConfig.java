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
 * 部门分红配置表
 *
 * @author Portal Team
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("soo_department_bonus_config")
@Schema(description = "部门分红配置")
public class DepartmentBonusConfig extends BaseEntity {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    @Schema(description = "主键ID")
    private Long id;

    @NotNull(message = "部门ID不能为空")
    @Schema(description = "部门ID", required = true)
    private Long departmentId;

    @Schema(description = "部门名称")
    private String departmentName;

    @NotNull(message = "分红权重不能为空")
    @DecimalMin(value = "0.0000", message = "分红权重不能小于0")
    @DecimalMax(value = "100.0000", message = "分红权重不能大于100")
    @Schema(description = "分红权重(0-100)", required = true)
    private BigDecimal bonusWeight;

    @NotNull(message = "生效日期不能为空")
    @Schema(description = "生效日期", required = true)
    private LocalDate effectiveDate;

    @Schema(description = "失效日期")
    private LocalDate expireDate;

    @Schema(description = "状态(1启用,0禁用)")
    private Integer status = 1;

    @Schema(description = "备注")
    private String remark;

    @TableLogic
    @Schema(description = "删除标识")
    private Integer delflag = 0;
} 