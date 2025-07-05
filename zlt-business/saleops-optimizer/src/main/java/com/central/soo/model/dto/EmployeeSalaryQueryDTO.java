package com.central.soo.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDate;

/**
 * 员工薪酬配置查询DTO
 *
 * @author Portal Team
 * @since 2024-12-19
 */
@Data
@Schema(description = "员工薪酬配置查询条件")
public class EmployeeSalaryQueryDTO {

    @Schema(description = "页码")
    private Integer pageNum = 1;

    @Schema(description = "页大小")
    private Integer pageSize = 20;

    @Schema(description = "员工姓名(模糊搜索)")
    private String employeeName;

    @Schema(description = "员工编号")
    private String employeeNo;

    @Schema(description = "部门ID(用于筛选员工)")
    private Long departmentId;

    @Schema(description = "薪酬配置状态: CONFIGURED-已配置, NOT_CONFIGURED-未配置, EXPIRED-已失效, OUT_OF_RANGE-超出范围")
    private String salaryStatus;

    @Schema(description = "生效日期")
    private LocalDate effectiveDate;

    @Schema(description = "状态(1启用,0禁用)")
    private Integer status;

    /**
     * 薪酬配置状态枚举
     */
    public enum SalaryStatus {
        CONFIGURED("已配置"),
        NOT_CONFIGURED("未配置"),
        EXPIRED("已失效"),
        OUT_OF_RANGE("超出范围");

        private final String description;

        SalaryStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
} 