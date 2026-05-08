package com.central.mall.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BannerDTO {
    private Long id;
    private String title;
    private String imageUrl;
    private Integer linkType;       // 1=goods, 2=external
    private Long goodsId;
    private String externalUrl;
    private Integer sort;
    private Integer status;
}
