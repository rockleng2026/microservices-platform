package com.central.mall.model.dto;

import lombok.Data;
import java.io.Serializable;

@Data
public class SpecValueDTO implements Serializable {
    private Long id;
    private String specValue;
}
