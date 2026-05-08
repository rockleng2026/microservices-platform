package com.central.mall.model.dto;

import lombok.Data;
import java.io.Serializable;
import java.util.List;

@Data
public class BatchStatusDTO implements Serializable {
    private List<Long> goodsIds;
    private Integer status;
}
