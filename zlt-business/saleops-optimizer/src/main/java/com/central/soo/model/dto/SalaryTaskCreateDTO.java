package com.central.soo.model.dto;

import lombok.Data;
import java.util.List;

/**
 * 薪酬计算任务创建DTO
 */
@Data
public class SalaryTaskCreateDTO {

    private String taskName;

    private String calculationMonth;

    private String calculationType; // FULL, DEPARTMENT, EMPLOYEE

    private List<Long> targetDepartmentIds;

    private List<Long> targetEmployeeIds;

    private List<Long> excludeEmployeeIds;

    private String remark;

    // 计算规则配置
    private CalculationRulesDTO calculationRules;

    @Data
    public static class CalculationRulesDTO {
        private Boolean baseCalculation = true;
        private Boolean performanceCalculation = true;
        private Boolean commissionCalculation = true;
        private Boolean socialSecurityCalculation = true;
        private Boolean taxCalculation = true;
    }
} 