package com.central.mall.model.dto;

import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class AdminGoodsDTO implements Serializable {
    private Long id;
    private Long categoryId;
    private String name;
    private String subTitle;
    private String mainImage;
    private String images;
    private String detail;
    private BigDecimal price;
    private Integer goodsType;
    private String virtualUrl;
    private Long virtualFileId;
    private LocalDateTime virtualExpire;
    private List<SkuDTO> skus;
    private Integer status;
    private Integer sort;
}
