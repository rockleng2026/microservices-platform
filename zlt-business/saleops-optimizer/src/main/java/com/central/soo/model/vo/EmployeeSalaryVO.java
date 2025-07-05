package com.central.soo.model.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 员工薪酬配置视图对象
 *
 * @author Portal Team
 * @since 2024-12-19
 */
@Data
@Schema(description = "员工薪酬配置视图")
public class EmployeeSalaryVO {

    @Schema(description = "配置ID")
    private Long id;

    @Schema(description = "员工ID")
    private Long employeeId;

    @Schema(description = "员工编号")
    private String employeeNo;

    @Schema(description = "员工姓名")
    private String employeeName;

    @Schema(description = "手机号")
    private String mobile;

    @Schema(description = "邮箱")
    private String email;

    @Schema(description = "部门ID")
    private Long departmentId;

    @Schema(description = "部门名称")
    private String departmentName;

    @Schema(description = "岗位ID")
    private Long positionId;

    @Schema(description = "岗位名称")
    private String positionName;

    @Schema(description = "职级标准信息")
    private JobLevelInfo jobLevelInfo;

    @Schema(description = "薪酬配置")
    private SalaryConfigDetail salaryConfig;

    /**
     * 职级标准信息
     */
    @Data
    @Schema(description = "职级标准信息")
    public static class JobLevelInfo {
        @Schema(description = "职级标准ID")
        private Long id;

        @Schema(description = "职级ID")
        private String jobLevelId;

        @Schema(description = "职级名称")
        private String jobLevelName;

        @Schema(description = "基础工资下限")
        private BigDecimal baseSalaryMin;

        @Schema(description = "基础工资上限")
        private BigDecimal baseSalaryMax;

        @Schema(description = "绩效比例下限")
        private BigDecimal performanceRatioMin;

        @Schema(description = "绩效比例上限")
        private BigDecimal performanceRatioMax;
    }

    /**
     * 薪酬配置详情
     */
    @Data
    @Schema(description = "薪酬配置详情")
    public static class SalaryConfigDetail {
        @Schema(description = "配置ID")
        private Long id;

        @Schema(description = "基础工资")
        private BigDecimal baseSalary;

        @Schema(description = "是否在工资范围内")
        private Boolean isInRange;

        @Schema(description = "地区编码")
        private String region;

        @Schema(description = "地区名称")
        private String regionName;

        @Schema(description = "是否参与销售提成(1是,0否)")
        private Integer isSalesIncentive;

        @Schema(description = "是否参与团队提成(1是,0否)")
        private Integer isTeamIncentive;

        @Schema(description = "是否参与部门分红(1是,0否)")
        private Integer isDepartmentBonus;

        @Schema(description = "销售提成比例")
        private BigDecimal salesIncentiveRatio;

        @Schema(description = "团队提成比例")
        private BigDecimal teamIncentiveRatio;

        @Schema(description = "生效日期")
        private LocalDate effectiveDate;

        @Schema(description = "失效日期")
        private LocalDate expireDate;

        @Schema(description = "状态(1启用,0禁用)")
        private Integer status;

        @Schema(description = "备注")
        private String remark;
    }
} 