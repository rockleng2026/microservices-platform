package com.central.organization.model.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 字典明细项VO
 *
 * @author Portal
 */
@Data
public class SysDictItemVO {

    /**
     * 主键ID
     */
    private String id;

    /**
     * 类目ID
     */
    private String categoryId;

    /**
     * 类目名称
     */
    private String categoryName;

    /**
     * 类目编码
     */
    private String categoryCode;

    /**
     * 项目编码
     */
    private String itemCode;

    /**
     * 项目名称
     */
    private String itemName;

    /**
     * 描述
     */
    private String description;

    /**
     * 排序值
     */
    private Integer sortOrder;

    /**
     * 是否默认项(0=否, 1=是)
     */
    private Integer isDefault;

    /**
     * 默认项描述
     */
    private String isDefaultText;

    /**
     * 状态(0=禁用, 1=启用)
     */
    private Integer status;

    /**
     * 状态描述
     */
    private String statusText;

    /**
     * 启用状态
     */
    private Boolean enabled;

    /**
     * 扩展数据(key-value形式)
     */
    private Map<String, Object> extendData;

    /**
     * 扩展数据JSON字符串
     */
    private String extendDataJson;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * 创建人姓名
     */
    private String createdByName;

    /**
     * 更新时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    /**
     * 更新人姓名
     */
    private String updatedByName;

    /**
     * 获取扩展数据JSON字符串
     * 如果extendData为空，返回"{}"
     */
    public String getExtendDataJson() {
        if (this.extendDataJson != null) {
            return this.extendDataJson;
        }
        
        if (this.extendData == null || this.extendData.isEmpty()) {
            return "{}";
        }
        
        try {
            // 简单的JSON字符串构建，实际项目中可以使用Jackson等JSON库
            StringBuilder json = new StringBuilder("{");
            boolean first = true;
            for (Map.Entry<String, Object> entry : this.extendData.entrySet()) {
                if (!first) {
                    json.append(",");
                }
                json.append("\"").append(entry.getKey()).append("\":");
                Object value = entry.getValue();
                if (value instanceof String) {
                    json.append("\"").append(value).append("\"");
                } else if (value == null) {
                    json.append("null");
                } else {
                    json.append(value.toString());
                }
                first = false;
            }
            json.append("}");
            return json.toString();
        } catch (Exception e) {
            return "{}";
        }
    }

    /**
     * 设置扩展数据JSON字符串
     */
    public void setExtendDataJson(String extendDataJson) {
        this.extendDataJson = extendDataJson;
    }
} 