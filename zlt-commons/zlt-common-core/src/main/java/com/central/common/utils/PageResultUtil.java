package com.central.common.utils;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.central.common.model.PageResult;

public class PageResultUtil {
    public static <T> PageResult<T> buildPageResult(IPage<T> page) {
        PageResult<T> result = new PageResult<>();
        result.setData(page.getRecords());
        result.setCount(page.getTotal());
        result.setPage((int) page.getCurrent());
        result.setSize((int) page.getSize());
        result.setPages((int) page.getPages());
        result.setResp_code(0); // 0 表示成功
        // 不设置code字段
        return result;
    }
} 