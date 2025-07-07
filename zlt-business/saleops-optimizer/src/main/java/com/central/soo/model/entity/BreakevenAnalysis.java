package com.central.soo.model.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 盈亏平衡分析实体
 */
@Data
@TableName("soo_breakeven_analysis")
public class BreakevenAnalysis {
    
    @TableId
    private Long id;
    
    /**
     * 任务ID
     */
    private String taskId;
    
    /**
     * 分析名称
     */
    private String analysisName;
    
    /**
     * 分析类型
     */
    private String analysisType;
    
    /**
     * 分析周期
     */
    private String period;
    
    /**
     * 总收入
     */
    private BigDecimal totalRevenue;
    
    /**
     * 总成本
     */
    private BigDecimal totalCost;
    
    /**
     * 盈亏平衡点
     */
    private BigDecimal breakevenPoint;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
} 