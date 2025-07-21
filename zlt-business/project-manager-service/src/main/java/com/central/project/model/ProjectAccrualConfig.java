package com.central.project.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;

@Data
@TableName("project_accrual_config")
public class ProjectAccrualConfig {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long projectId;
    @TableField("model_instance_id")
    private Long modelInstanceId;
    private String modelVariableCode;
    private String type; // group/department/employee/personal
    private String name;
    private BigDecimal maxAmount;
    private BigDecimal maxRatio;
    private Integer sort;
    private Date createdAt;
    private Date updatedAt;
    @TableField("tenant_id")
    private String tenantId;
} 