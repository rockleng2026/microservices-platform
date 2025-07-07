package com.central.common.model;

import java.io.Serializable;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 分页实体类
 *
 * @author zlt
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResult<T> implements Serializable {
    private static final long serialVersionUID = -275582248840137389L;
    /**
     * 总数
     */
    private Long count;
    /**
     * 是否成功：0 成功、1 失败
     */
    @Deprecated
    private int code;

    /**
     * 业务系统响应错误码使用这个，废弃code code为原框架系统使用 0-成功 其他-失败
     */
    private int resp_code;

    /**
     * 当前页
     */
    private Integer page;
    /**
     * 当前分页的数量
     */
    private Integer size;
    /**
     * 总共的页数
     */
    private Integer pages;


    /**
     * 当前页结果集
     */
    private List<T> data;
}
