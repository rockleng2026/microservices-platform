package com.central.soo.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.central.common.model.BaseEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 工资计算结果表
 *
 * @author Portal Team
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("soo_payroll_result")
@Schema(description = "工资计算结果")
public class PayrollResult extends BaseEntity {
    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    @Schema(description = "主键ID")
    private Long id;

    @Schema(description = "月份(YYYY-MM)")
    private String month;

    @Schema(description = "员工ID")
    private Long employeeId;

    @Schema(description = "员工姓名")
    private String employeeName;

    @Schema(description = "员工编号")
    private String employeeNo;

    @Schema(description = "部门ID")
    private Long departmentId;

    @Schema(description = "部门名称")
    private String departmentName;

    @Schema(description = "岗位ID")
    private Long positionId;

    @Schema(description = "职级ID")
    private String jobLevelId;

    @Schema(description = "地区")
    private String region;

    // 基础薪酬
    @Schema(description = "基础工资")
    private BigDecimal baseSalary;
    @Schema(description = "地区系数")
    private BigDecimal regionCoefficient;
    @Schema(description = "调整后基础工资")
    private BigDecimal adjustedBaseSalary;

    // 绩效薪酬
    @Schema(description = "绩效得分")
    private BigDecimal performanceScore;
    @Schema(description = "绩效比例")
    private BigDecimal performanceRatio;
    @Schema(description = "绩效工资")
    private BigDecimal performancePay;

    // 提成薪酬
    @Schema(description = "个人项目提成")
    private BigDecimal personalCommission;
    @Schema(description = "团队项目提成")
    private BigDecimal teamCommission;
    @Schema(description = "部门分红")
    private BigDecimal departmentBonus;

    // 应发工资
    @Schema(description = "应发工资合计")
    private BigDecimal grossPay;

    // 社保公积金(个人部分)
    @Schema(description = "个人养老保险")
    private BigDecimal personalPension;
    @Schema(description = "个人医疗保险")
    private BigDecimal personalMedical;
    @Schema(description = "个人失业保险")
    private BigDecimal personalUnemployment;
    @Schema(description = "个人公积金")
    private BigDecimal personalHousingFund;
    @Schema(description = "个人社保公积金合计")
    private BigDecimal personalSocialTotal;

    // 个人所得税
    @Schema(description = "应纳税所得额")
    private BigDecimal taxableIncome;
    @Schema(description = "个人所得税")
    private BigDecimal personalIncomeTax;

    // 实发工资
    @Schema(description = "实发工资")
    private BigDecimal netPay;

    // 公司成本
    @Schema(description = "公司养老保险")
    private BigDecimal companyPension;
    @Schema(description = "公司医疗保险")
    private BigDecimal companyMedical;
    @Schema(description = "公司失业保险")
    private BigDecimal companyUnemployment;
    @Schema(description = "公司生育保险")
    private BigDecimal companyMaternity;
    @Schema(description = "公司工伤保险")
    private BigDecimal companyInjury;
    @Schema(description = "公司公积金")
    private BigDecimal companyHousingFund;
    @Schema(description = "公司社保公积金合计")
    private BigDecimal companySocialTotal;
    @Schema(description = "公司总成本")
    private BigDecimal totalCost;

    // 计算相关
    @Schema(description = "计算规则(JSON)")
    private String calculationRule;
    @Schema(description = "计算日志")
    private String calculationLog;
    @Schema(description = "是否最终确认(1是,0否)")
    private Integer isFinal = 0;
    @Schema(description = "确认人")
    private Long confirmedBy;
    @Schema(description = "确认时间")
    private LocalDateTime confirmedAt;

    @Schema(description = "状态(1有效,0无效)")
    private Integer status = 1;

    @TableLogic
    @Schema(description = "删除标识")
    private Integer delflag = 0;
} 