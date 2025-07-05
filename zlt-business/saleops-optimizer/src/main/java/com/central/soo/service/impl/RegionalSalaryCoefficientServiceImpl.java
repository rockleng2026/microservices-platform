package com.central.soo.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.common.model.Result;
import com.central.soo.mapper.RegionalSalaryCoefficientMapper;
import com.central.soo.model.dto.RegionalSalaryCoefficientQueryDTO;
import com.central.soo.model.entity.RegionalSalaryCoefficient;
import com.central.soo.service.IRegionalSalaryCoefficientService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 地区工资系数服务实现类
 *
 * @author zlt
 * @date 2024-01-01
 */
@Slf4j
@Service
public class RegionalSalaryCoefficientServiceImpl extends ServiceImpl<RegionalSalaryCoefficientMapper, RegionalSalaryCoefficient>
        implements IRegionalSalaryCoefficientService {

    @Override
    public Result<Page<RegionalSalaryCoefficient>> pageQuery(RegionalSalaryCoefficientQueryDTO queryDTO) {
        try {
            LambdaQueryWrapper<RegionalSalaryCoefficient> wrapper = new LambdaQueryWrapper<>();
            
            // 地区模糊查询
            if (StringUtils.hasText(queryDTO.getRegion())) {
                wrapper.like(RegionalSalaryCoefficient::getRegion, queryDTO.getRegion());
            }
            
            // 地区编码查询
            if (StringUtils.hasText(queryDTO.getRegionCode())) {
                wrapper.like(RegionalSalaryCoefficient::getRegionCode, queryDTO.getRegionCode());
            }
            
            // 状态查询
            if (queryDTO.getStatus() != null) {
                wrapper.eq(RegionalSalaryCoefficient::getStatus, queryDTO.getStatus());
            }
            
            // 生效日期范围查询
            if (queryDTO.getEffectiveDateStart() != null) {
                wrapper.ge(RegionalSalaryCoefficient::getEffectiveDate, queryDTO.getEffectiveDateStart());
            }
            if (queryDTO.getEffectiveDateEnd() != null) {
                wrapper.le(RegionalSalaryCoefficient::getEffectiveDate, queryDTO.getEffectiveDateEnd());
            }
            
            // 是否包含已失效数据
            if (queryDTO.getIncludeExpired() == null || !queryDTO.getIncludeExpired()) {
                LocalDate today = LocalDate.now();
                wrapper.and(w -> w.isNull(RegionalSalaryCoefficient::getExpireDate)
                        .or().gt(RegionalSalaryCoefficient::getExpireDate, today));
            }
            
            // 排序：排序号升序，生效日期降序
            wrapper.orderByAsc(RegionalSalaryCoefficient::getSortOrder)
                    .orderByDesc(RegionalSalaryCoefficient::getEffectiveDate);
            
            Page<RegionalSalaryCoefficient> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());
            Page<RegionalSalaryCoefficient> result = this.page(page, wrapper);
            
            return Result.succeed(result);
        } catch (Exception e) {
            log.error("分页查询地区工资系数失败", e);
            return Result.failed("查询失败：" + e.getMessage());
        }
    }

    @Override
    public boolean checkRegionDateOverlap(String region, LocalDate effectiveDate, LocalDate expireDate, Long excludeId) {
        LambdaQueryWrapper<RegionalSalaryCoefficient> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RegionalSalaryCoefficient::getRegion, region);
        
        // 排除指定ID（编辑时使用）
        if (excludeId != null) {
            wrapper.ne(RegionalSalaryCoefficient::getId, excludeId);
        }
        
        // 检查日期重叠
        wrapper.and(w -> {
            // 情况1：新配置的生效日期在现有配置的有效期内
            w.le(RegionalSalaryCoefficient::getEffectiveDate, effectiveDate)
                    .and(subW -> subW.isNull(RegionalSalaryCoefficient::getExpireDate)
                            .or().gt(RegionalSalaryCoefficient::getExpireDate, effectiveDate));
            
            // 情况2：新配置的失效日期在现有配置的有效期内（如果有失效日期）
            if (expireDate != null) {
                w.or(orW -> orW.le(RegionalSalaryCoefficient::getEffectiveDate, expireDate)
                        .and(subW -> subW.isNull(RegionalSalaryCoefficient::getExpireDate)
                                .or().gt(RegionalSalaryCoefficient::getExpireDate, expireDate)));
                
                // 情况3：现有配置完全在新配置的有效期内
                w.or(orW -> orW.ge(RegionalSalaryCoefficient::getEffectiveDate, effectiveDate)
                        .le(RegionalSalaryCoefficient::getEffectiveDate, expireDate));
            }
        });
        
        return this.count(wrapper) > 0;
    }

    @Override
    public RegionalSalaryCoefficient getEffectiveCoefficient(String region, LocalDate targetDate) {
        LambdaQueryWrapper<RegionalSalaryCoefficient> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RegionalSalaryCoefficient::getRegion, region)
                .eq(RegionalSalaryCoefficient::getStatus, 1)
                .le(RegionalSalaryCoefficient::getEffectiveDate, targetDate)
                .and(w -> w.isNull(RegionalSalaryCoefficient::getExpireDate)
                        .or().gt(RegionalSalaryCoefficient::getExpireDate, targetDate))
                .orderByDesc(RegionalSalaryCoefficient::getEffectiveDate)
                .last("LIMIT 1");
        
        return this.getOne(wrapper);
    }

    @Override
    public List<String> getActiveRegions() {
        LambdaQueryWrapper<RegionalSalaryCoefficient> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RegionalSalaryCoefficient::getStatus, 1)
                .select(RegionalSalaryCoefficient::getRegion);
        
        LocalDate today = LocalDate.now();
        wrapper.le(RegionalSalaryCoefficient::getEffectiveDate, today)
                .and(w -> w.isNull(RegionalSalaryCoefficient::getExpireDate)
                        .or().gt(RegionalSalaryCoefficient::getExpireDate, today));
        
        return this.list(wrapper).stream()
                .map(RegionalSalaryCoefficient::getRegion)
                .distinct()
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> batchUpdateStatus(List<Long> ids, Integer status) {
        try {
            if (ids == null || ids.isEmpty()) {
                return Result.failed("ID列表不能为空");
            }
            
            if (status == null || (status != 0 && status != 1)) {
                return Result.failed("状态值无效");
            }
            
            LambdaUpdateWrapper<RegionalSalaryCoefficient> wrapper = new LambdaUpdateWrapper<>();
            wrapper.in(RegionalSalaryCoefficient::getId, ids)
                    .set(RegionalSalaryCoefficient::getStatus, status);
            
            boolean success = this.update(wrapper);
            if (success) {
                return Result.succeed("批量更新状态成功");
            } else {
                return Result.failed("批量更新状态失败");
            }
        } catch (Exception e) {
            log.error("批量更新状态失败", e);
            return Result.failed("批量更新状态失败：" + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> copyToNewRegion(Long sourceId, String targetRegion, String targetRegionCode, LocalDate effectiveDate) {
        try {
            // 获取源配置
            RegionalSalaryCoefficient source = this.getById(sourceId);
            if (source == null) {
                return Result.failed("源配置不存在");
            }
            
            // 检查目标地区是否已存在配置
            if (checkRegionDateOverlap(targetRegion, effectiveDate, null, null)) {
                return Result.failed("目标地区在指定日期已存在配置");
            }
            
            // 创建新配置
            RegionalSalaryCoefficient newConfig = new RegionalSalaryCoefficient();
            BeanUtils.copyProperties(source, newConfig);
            newConfig.setId(null);
            newConfig.setRegion(targetRegion);
            newConfig.setRegionCode(targetRegionCode);
            newConfig.setEffectiveDate(effectiveDate);
            newConfig.setExpireDate(null);
            newConfig.setStatus(1);
            // 清空审计字段，让系统自动设置
            // newConfig.setCreatedAt(null);
            // newConfig.setUpdatedAt(null);
            // newConfig.setCreatedBy(null);
            // newConfig.setUpdatedBy(null);
            
            boolean success = this.save(newConfig);
            if (success) {
                return Result.succeed("复制配置成功");
            } else {
                return Result.failed("复制配置失败");
            }
        } catch (Exception e) {
            log.error("复制配置失败", e);
            return Result.failed("复制配置失败：" + e.getMessage());
        }
    }
} 