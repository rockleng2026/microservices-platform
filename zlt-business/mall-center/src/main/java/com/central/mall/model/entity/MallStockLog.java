package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("mall_stock_log")
public class MallStockLog {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String tenantId;
    private Long skuId;
    private Long orderId;          // 关联订单ID（手动修正时可为空）
    private Integer change;         // 库存变化（正数=增加，负数=减少）
    private Integer stockBefore;    // 变更前库存
    private Integer stockAfter;     // 变更后库存
    private Integer operationType;  // 1=预占, 2=真实扣减, 3=释放/回滚, 4=手动修正
    private String operator;        // 操作人
    private String remark;          // 备注
    private LocalDateTime createTime;
}