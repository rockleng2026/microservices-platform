package com.central.organization.model.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;

/**
 * 通用字典明细项查询DTO
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Data
public class SysDictItemQueryDTO {

    /**
     * 页码(从1开始)
     */
    private Integer page = 1;

    /**
     * 每页大小
     */
    private Integer size = 20;

    /**
     * 类目ID
     */
    @NotNull(message = "类目ID不能为空")
    private Long categoryId;

    /**
     * 搜索关键字(项目编码或名称)
     */
    private String keyword;

    /**
     * 状态筛选(0=禁用, 1=启用)
     */
    private Integer status;

    /**
     * 是否默认项筛选(0=否, 1=是)
     */
    private Integer isDefault;

    /**
     * 租户ID
     */
    private String tenantId;

    /**
     * 获取分页偏移量
     * @return 偏移量
     */
    public Integer getOffset() {
        if (page == null || size == null) {
            return 0;
        }
        return (page - 1) * size;
    }
} 