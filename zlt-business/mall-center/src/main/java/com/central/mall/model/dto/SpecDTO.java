package com.central.mall.model.dto;

import lombok.Data;
import java.io.Serializable;
import java.util.List;

@Data
public class SpecDTO implements Serializable {
    private Long id;
    private String specName;
    private List<SpecValueDTO> values;
}
