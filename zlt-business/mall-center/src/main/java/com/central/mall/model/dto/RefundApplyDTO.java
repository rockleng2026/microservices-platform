package com.central.mall.model.dto;

import lombok.Data;
import javax.validation.constraints.*;
import java.math.BigDecimal;

/**
 * 退款申请DTO
 */
@Data
public class RefundApplyDTO {
    @NotNull(message = "订单ID不能为空")
    private Long orderId;

    @NotNull(message = "退款类型不能为空")
    private Integer refundType;  // 1=仅退款, 2=退货退款

    @NotNull(message = "退款金额不能为空")
    @DecimalMin(value = "0.01", message = "退款金额最小0.01元")
    private BigDecimal refundAmount;

    @Size(max = 500, message = "退款原因最多500字")
    private String reason;

    private String evidenceImages;  // JSON array: ["url1","url2"]
}
