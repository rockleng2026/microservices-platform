package com.central.mall.model.dto;

import lombok.Data;

@Data
public class ExpressDTO {
    private Long id;  // optional for create
    private String name;  // required, e.g., 顺丰速运
    private String code;  // required, e.g., SF, YTO
    private String logo;  // optional, URL to logo
    private Integer sort;  // optional, default 0
    private Integer status;  // 0=disabled, 1=enabled, default 1
}