package com.central.mall.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

@Data
@Schema(description = "库存创建请求")
public class StockCreateDTO {

    @NotNull(message = "商品ID不能为空")
    @Schema(description = "商品ID")
    private Long goodsId;

    @NotBlank(message = "SKU编码不能为空")
    @Schema(description = "SKU编码")
    private String skuCode;

    @Schema(description = "规格JSON, 如{\"color\":\"red\",\"size\":\"M\"}")
    private String specs;

    @NotNull(message = "价格不能为空")
    @Positive(message = "价格必须大于0")
    @Schema(description = "SKU价格")
    private BigDecimal price;

    @NotNull(message = "初始库存不能为空")
    @Schema(description = "初始库存数量")
    private Integer stock = 0;

    @Schema(description = "状态: 1=启用, 0=禁用")
    private Integer status = 1;
}