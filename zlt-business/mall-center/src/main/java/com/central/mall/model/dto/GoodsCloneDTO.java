package com.central.mall.model.dto;

import lombok.Data;
import java.io.Serializable;

@Data
public class GoodsCloneDTO implements Serializable {
    private Long goodsId;
    private Long newCategoryId;
    private String newName;
}
