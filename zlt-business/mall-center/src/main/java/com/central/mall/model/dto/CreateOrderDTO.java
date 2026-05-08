package com.central.mall.model.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateOrderDTO {
    private Integer goodsType;       // 1=实物, 2=虚拟
    private Long addressId;          // 收货地址ID（虚拟商品可为空）
    private List<Long> cartItemIds;  // 从购物车购买时的购物车项ID列表
    private List<DirectBuyItemDTO> items;  // 直接购买时的商品列表
    private String remark;           // 订单备注

    @Data
    public static class DirectBuyItemDTO {
        private Long skuId;
        private Integer quantity;
    }
}