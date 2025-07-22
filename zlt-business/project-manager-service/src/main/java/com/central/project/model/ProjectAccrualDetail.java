package com.central.project.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;

@Data
@TableName("project_accrual_detail")
public class ProjectAccrualDetail {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long projectId;
    private Long configId;
    private String type; // group/department/employee/personal
    private Long targetId;
    private String targetName;
    private BigDecimal amount;
    private BigDecimal ratio;
    private Date createdAt;
    private Date updatedAt;
    @TableField("tenant_id")
    private String tenantId;
} 