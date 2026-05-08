package com.central.mall.model.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderDetailDTO {
    // Order info
    private Long id;
    private String orderNo;
    private Long userId;
    private Integer goodsType;
    private String goodsTypeDesc;
    private BigDecimal totalAmount;
    private BigDecimal freightAmount;
    private BigDecimal payAmount;
    private Integer status;
    private String statusDesc;
    private String remark;
    private LocalDateTime payTime;
    private LocalDateTime shipTime;
    private LocalDateTime completeTime;
    private LocalDateTime createTime;

    // Address info (if physical)
    private Long addressId;
    private String addressName;
    private String addressPhone;
    private String addressDetail;

    // Order items
    private List<OrderItemDTO> items;

    // Delivery info (if exists)
    private DeliveryDTO delivery;

    public String getGoodsTypeDesc() {
        if (goodsType == null) return "";
        return goodsType == 1 ? "实物" : "虚拟";
    }

    public String getStatusDesc() {
        if (status == null) return "";
        switch (status) {
            case 1: return "待付款";
            case 2: return "已付款";
            case 3: return "已发货";
            case 4: return "已完成";
            case 5: return "已取消";
            default: return "未知";
        }
    }

    @Data
    public static class OrderItemDTO {
        private Long skuId;
        private Long goodsId;
        private String goodsName;
        private String skuSpecs;
        private String goodsImage;
        private BigDecimal price;
        private Integer quantity;
        private BigDecimal subtotal;
    }

    @Data
    public static class DeliveryDTO {
        private String expressCode;
        private String expressName;
        private String waybillNo;
        private LocalDateTime shipTime;
    }
}