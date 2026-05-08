package com.central.mall.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SettingsDTO {
    private String key;
    private String value;           // masked if sensitive
    private String type;            // string/int/json
    private String description;
}
