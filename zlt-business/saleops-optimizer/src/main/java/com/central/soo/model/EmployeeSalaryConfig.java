package com.central.soo.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.central.common.model.BaseEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 员工薪酬配置表
 *
 * @author Portal Team
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("soo_employee_salary_config")
@Schema(description = "员工薪酬配置")
public class EmployeeSalaryConfig extends BaseEntity {
    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    @Schema(description = "主键ID")
    private Long id;

    @NotNull(message = "员工ID不能为空")
    @Schema(description = "员工ID", required = true)
    private Long employeeId;

    @Schema(description = "员工姓名")
    private String employeeName;

    @Schema(description = "员工编号")
    private String employeeNo;

    @NotNull(message = "部门ID不能为空")
    @Schema(description = "部门ID", required = true)
    private Long departmentId;

    @Schema(description = "岗位ID")
    private Long positionId;

    @NotNull(message = "职级ID不能为空")
    @Schema(description = "职级ID", required = true)
    private String jobLevelId;

    @NotNull(message = "基础工资不能为空")
    @Schema(description = "基础工资", required = true)
    private BigDecimal baseSalary;

    @NotNull(message = "所在地区不能为空")
    @Schema(description = "所在地区", required = true)
    private String region;

    @Schema(description = "是否参与销售提成(1是,0否)")
    private Integer isSalesIncentive = 0;

    @Schema(description = "是否参与团队提成(1是,0否)")
    private Integer isTeamIncentive = 0;

    @Schema(description = "是否参与部门分红(1是,0否)")
    private Integer isDepartmentBonus = 0;

    @Schema(description = "销售提成比例")
    private BigDecimal salesIncentiveRatio;

    @Schema(description = "团队提成比例")
    private BigDecimal teamIncentiveRatio;

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