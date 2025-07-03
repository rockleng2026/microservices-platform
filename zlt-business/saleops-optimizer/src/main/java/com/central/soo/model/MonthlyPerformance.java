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
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;

/**
 * 月度绩效表
 *
 * @author Portal Team
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("soo_monthly_performance")
@Schema(description = "月度绩效")
public class MonthlyPerformance extends BaseEntity {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    @Schema(description = "主键ID")
    private Long id;

    @NotBlank(message = "月份不能为空")
    @Schema(description = "月份(YYYY-MM)", required = true)
    private String month;

    @NotNull(message = "员工ID不能为空")
    @Schema(description = "员工ID", required = true)
    private Long employeeId;

    @Schema(description = "员工姓名")
    private String employeeName;

    @Schema(description = "部门ID")
    private Long departmentId;

    @NotNull(message = "绩效得分不能为空")
    @DecimalMin(value = "0.00", message = "绩效得分不能小于0")
    @DecimalMax(value = "100.00", message = "绩效得分不能大于100")
    @Schema(description = "绩效得分(0-100)", required = true)
    private BigDecimal performanceScore;

    @Schema(description = "个人项目营业额")
    private BigDecimal personalProjectRevenue = BigDecimal.ZERO;

    @DecimalMin(value = "0.0000", message = "个人项目毛利率不能小于0")
    @DecimalMax(value = "1.0000", message = "个人项目毛利率不能大于1")
    @Schema(description = "个人项目毛利率")
    private BigDecimal personalProjectMargin = BigDecimal.ZERO;

    @Schema(description = "个人项目毛利润")
    private BigDecimal personalProjectProfit = BigDecimal.ZERO;

    @Schema(description = "团队项目ID(多个用逗号分隔)")
    private String teamProjectId;

    @Schema(description = "团队项目营业额")
    private BigDecimal teamProjectRevenue = BigDecimal.ZERO;

    @DecimalMin(value = "0.0000", message = "团队项目毛利率不能小于0")
    @DecimalMax(value = "1.0000", message = "团队项目毛利率不能大于1")
    @Schema(description = "团队项目毛利率")
    private BigDecimal teamProjectMargin = BigDecimal.ZERO;

    @Schema(description = "团队项目毛利润")
    private BigDecimal teamProjectProfit = BigDecimal.ZERO;

    @Schema(description = "团队成员数量")
    private Integer teamMemberCount = 1;

    @Schema(description = "KPI得分详情(JSON格式)")
    private String kpiScores;

    @Schema(description = "绩效备注")
    private String performanceRemark;

    @Schema(description = "状态(1有效,0无效)")
    private Integer status = 1;

    @TableLogic
    @Schema(description = "删除标识")
    private Integer delflag = 0;
} 