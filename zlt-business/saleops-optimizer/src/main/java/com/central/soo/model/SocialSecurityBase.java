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
 * 社保公积金基数配置表
 *
 * @author Portal Team
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("soo_social_security_base")
@Schema(description = "社保公积金基数配置")
public class SocialSecurityBase extends BaseEntity {
    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    @Schema(description = "主键ID")
    private Long id;

    @NotNull(message = "地区不能为空")
    @Schema(description = "地区", required = true)
    private String region;

    @NotNull(message = "年度不能为空")
    @Schema(description = "年度", required = true)
    private Integer year;

    @NotNull(message = "社保基数上限不能为空")
    @Schema(description = "社保基数上限", required = true)
    private BigDecimal socialSecurityBaseUpper;

    @NotNull(message = "社保基数下限不能为空")
    @Schema(description = "社保基数下限", required = true)
    private BigDecimal socialSecurityBaseLower;

    @NotNull(message = "公积金基数上限不能为空")
    @Schema(description = "公积金基数上限", required = true)
    private BigDecimal housingFundBaseUpper;

    @NotNull(message = "公积金基数下限不能为空")
    @Schema(description = "公积金基数下限", required = true)
    private BigDecimal housingFundBaseLower;

    // 个人缴费比例（百分数形式，如5表示5%）
    @NotNull(message = "养老保险个人比例不能为空")
    @DecimalMin(value = "0", message = "养老保险个人比例不能小于0")
    @DecimalMax(value = "100", message = "养老保险个人比例不能大于100")
    @Schema(description = "养老保险个人比例（百分数，如5表示5%）", required = true)
    private BigDecimal pensionPersonalRatio;

    @NotNull(message = "医疗保险个人比例不能为空")
    @DecimalMin(value = "0", message = "医疗保险个人比例不能小于0")
    @DecimalMax(value = "100", message = "医疗保险个人比例不能大于100")
    @Schema(description = "医疗保险个人比例（百分数，如2表示2%）", required = true)
    private BigDecimal medicalPersonalRatio;

    @NotNull(message = "失业保险个人比例不能为空")
    @DecimalMin(value = "0", message = "失业保险个人比例不能小于0")
    @DecimalMax(value = "100", message = "失业保险个人比例不能大于100")
    @Schema(description = "失业保险个人比例（百分数，如0.5表示0.5%）", required = true)
    private BigDecimal unemploymentPersonalRatio;

    @NotNull(message = "公积金个人比例不能为空")
    @DecimalMin(value = "0", message = "公积金个人比例不能小于0")
    @DecimalMax(value = "100", message = "公积金个人比例不能大于100")
    @Schema(description = "公积金个人比例（百分数，如12表示12%）", required = true)
    private BigDecimal housingFundPersonalRatio;

    // 公司缴费比例（百分数形式，如16表示16%）
    @NotNull(message = "养老保险公司比例不能为空")
    @DecimalMin(value = "0", message = "养老保险公司比例不能小于0")
    @DecimalMax(value = "100", message = "养老保险公司比例不能大于100")
    @Schema(description = "养老保险公司比例（百分数，如16表示16%）", required = true)
    private BigDecimal pensionCompanyRatio;

    @NotNull(message = "医疗保险公司比例不能为空")
    @DecimalMin(value = "0", message = "医疗保险公司比例不能小于0")
    @DecimalMax(value = "100", message = "医疗保险公司比例不能大于100")
    @Schema(description = "医疗保险公司比例（百分数，如10表示10%）", required = true)
    private BigDecimal medicalCompanyRatio;

    @NotNull(message = "失业保险公司比例不能为空")
    @DecimalMin(value = "0", message = "失业保险公司比例不能小于0")
    @DecimalMax(value = "100", message = "失业保险公司比例不能大于100")
    @Schema(description = "失业保险公司比例（百分数，如1表示1%）", required = true)
    private BigDecimal unemploymentCompanyRatio;

    @NotNull(message = "生育保险公司比例不能为空")
    @DecimalMin(value = "0", message = "生育保险公司比例不能小于0")
    @DecimalMax(value = "100", message = "生育保险公司比例不能大于100")
    @Schema(description = "生育保险公司比例（百分数，如0.8表示0.8%）", required = true)
    private BigDecimal maternityCompanyRatio;

    @NotNull(message = "工伤保险公司比例不能为空")
    @DecimalMin(value = "0", message = "工伤保险公司比例不能小于0")
    @DecimalMax(value = "100", message = "工伤保险公司比例不能大于100")
    @Schema(description = "工伤保险公司比例（百分数，如0.5表示0.5%）", required = true)
    private BigDecimal injuryCompanyRatio;

    @NotNull(message = "公积金公司比例不能为空")
    @DecimalMin(value = "0", message = "公积金公司比例不能小于0")
    @DecimalMax(value = "100", message = "公积金公司比例不能大于100")
    @Schema(description = "公积金公司比例（百分数，如12表示12%）", required = true)
    private BigDecimal housingFundCompanyRatio;

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

    @Schema(description = "租户ID")
    private String tenantId;
} 