package com.central.soo.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.central.soo.model.DepartmentBonusConfig;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.List;

public interface IDepartmentBonusConfigService extends IService<DepartmentBonusConfig> {
    // 可扩展自定义方法

    /**
     * 分页条件查询
     */
    IPage<DepartmentBonusConfig> pageQuery(com.baomidou.mybatisplus.extension.plugins.pagination.Page<DepartmentBonusConfig> page, Long departmentId, String departmentName, Integer status, java.time.LocalDate startDate, java.time.LocalDate endDate);

    /**
     * 校验同一生效日下分红权重总和
     */
    boolean checkBonusWeightValid(Long departmentId, LocalDate effectiveDate, BigDecimal bonusWeight, Long excludeId);

    /**
     * 查询部门历史分红配置
     */
    List<DepartmentBonusConfig> getHistoryByDepartment(Long departmentId);

    /**
     * 恢复已删除的分红配置
     */
    boolean restore(Long id);
} 