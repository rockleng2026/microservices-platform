package com.central.mall.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class CreateOrderDTO {
    @NotNull(message = "商品类型不能为空")
    private Integer goodsType;       // 1=实物, 2=虚拟

    // addressId required for physical goods
    private Long addressId;

    // From cart purchase
    private List<Long> cartItemIds;

    // Direct purchase
    private List<DirectBuyItemDTO> items;

    private String remark;

    @Data
    public static class DirectBuyItemDTO {
        @NotNull(message = "SKU不能为空")
        private Long skuId;

        @NotNull(message = "数量不能为空")
        private Integer quantity;

        private Long goodsId;
    }
}