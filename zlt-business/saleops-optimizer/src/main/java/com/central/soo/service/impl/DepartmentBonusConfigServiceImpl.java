package com.central.soo.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.soo.mapper.DepartmentBonusConfigMapper;
import com.central.soo.model.DepartmentBonusConfig;
import com.central.soo.service.IDepartmentBonusConfigService;
import org.springframework.stereotype.Service;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.List;
import com.central.soo.service.IDepartmentClient;
import org.springframework.beans.factory.annotation.Autowired;
import com.central.common.exception.BusinessException;

@Service
public class DepartmentBonusConfigServiceImpl extends ServiceImpl<DepartmentBonusConfigMapper, DepartmentBonusConfig> implements IDepartmentBonusConfigService {
    @Autowired(required = false)
    private IDepartmentClient departmentClient;

    // 可扩展自定义业务逻辑

    @Override
    public IPage<DepartmentBonusConfig> pageQuery(Page<DepartmentBonusConfig> page, Long departmentId, String departmentName, Integer status, LocalDate startDate, LocalDate endDate) {
        QueryWrapper<DepartmentBonusConfig> qw = new QueryWrapper<>();
        if (departmentId != null) qw.eq("department_id", departmentId);
        if (departmentName != null && !departmentName.isEmpty()) qw.like("department_name", departmentName);
        if (status != null) qw.eq("status", status);
        if (startDate != null) qw.ge("effective_date", startDate);
        if (endDate != null) qw.le("effective_date", endDate);
        qw.eq("delflag", 0);
        qw.orderByDesc("effective_date");
        return this.page(page, qw);
    }

    @Override
    public boolean checkBonusWeightValid(Long departmentId, LocalDate effectiveDate, BigDecimal bonusWeight, Long excludeId) {
        QueryWrapper<DepartmentBonusConfig> qw = new QueryWrapper<>();
        qw.eq("effective_date", effectiveDate);
        qw.eq("delflag", 0);
        qw.eq("status", 1); // 只统计启用
        if (excludeId != null) qw.ne("id", excludeId);
        // 只校验同一生效日下所有"启用"分红权重之和
        BigDecimal sum = baseMapper.selectList(qw).stream()
                .map(DepartmentBonusConfig::getBonusWeight)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (bonusWeight != null) sum = sum.add(bonusWeight);
        return sum.compareTo(BigDecimal.valueOf(100)) <= 0;
    }

    @Override
    public List<DepartmentBonusConfig> getHistoryByDepartment(Long departmentId) {
        QueryWrapper<DepartmentBonusConfig> qw = new QueryWrapper<>();
        qw.eq("department_id", departmentId);
        qw.eq("delflag", 0);
        qw.orderByDesc("effective_date");
        return this.list(qw);
    }

    @Override
    public boolean restore(Long id) {
        DepartmentBonusConfig config = this.getById(id);
        if (config != null && config.getDelflag() != null && config.getDelflag() == 1) {
            config.setDelflag(0);
            return this.updateById(config);
        }
        return false;
    }

    @Override
    public boolean save(DepartmentBonusConfig entity) {
        // 保存前自动补全部门名称
        if (entity.getDepartmentId() != null && (entity.getDepartmentName() == null || entity.getDepartmentName().isEmpty())) {
            try {
                com.central.common.model.Result<IDepartmentClient.DepartmentDTO> result = departmentClient.getDepartmentById(entity.getDepartmentId());
                if (result != null && result.getDatas() != null && result.getDatas().name != null) {
                    entity.setDepartmentName(result.getDatas().name);
                }
            } catch (Exception e) {
                log.error("get department failed", e);
            }
        }
        // 校验分红权重
        if (entity.getStatus() == null || entity.getStatus() == 1) {
            boolean valid = checkBonusWeightValid(entity.getDepartmentId(), entity.getEffectiveDate(), entity.getBonusWeight(), entity.getId());
            if (!valid) {
                throw new BusinessException("分红权重之和不能超过100%", 10001);
            }
        }
        return super.save(entity);
    }
} 