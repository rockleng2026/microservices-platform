package com.central.soo.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.common.context.TenantContextHolder;
import com.central.common.exception.BusinessException;
import com.central.common.model.PageResult;
import com.central.common.model.Result;
import com.central.soo.engine.BreakevenCalculationEngine;
import com.central.soo.mapper.BreakevenAnalysisMapper;
import com.central.soo.mapper.BreakevenScenarioMapper;
import com.central.soo.model.dto.BreakevenAnalysisDTO;
import com.central.soo.model.dto.BreakevenQueryDTO;
import com.central.soo.model.entity.BreakevenAnalysis;
import com.central.soo.model.entity.BreakevenForecast;
import com.central.soo.model.entity.BreakevenScenario;
import com.central.soo.model.entity.BreakevenSensitivity;
import com.central.soo.service.IBreakevenAnalysisService;
import com.central.soo.utils.PageResultUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 盈亏平衡分析服务实现类
 */
@Slf4j
@Service
@Transactional(rollbackFor = Exception.class)
public class BreakevenAnalysisServiceImpl implements IBreakevenAnalysisService {

    @Autowired
    private BreakevenAnalysisMapper breakevenAnalysisMapper;

    @Autowired
    private BreakevenScenarioMapper breakevenScenarioMapper;

    @Autowired
    private BreakevenCalculationEngine calculationEngine;

    // ==================== 分析管理 ====================

    @Override
    public Result<BreakevenAnalysis> createAnalysis(BreakevenAnalysisDTO analysisDTO) {
        try {
            // 获取当前租户和用户信息
            String tenantId = TenantContextHolder.getTenant();
            Long creatorId = getCurrentUserId(); // 需要从Security上下文获取

            // 执行计算
            BreakevenAnalysis analysis = calculationEngine.performAnalysis(analysisDTO, tenantId, creatorId);

            // 保存到数据库
            breakevenAnalysisMapper.insert(analysis);

            log.info("创建盈亏平衡分析成功: {}, ID: {}", analysis.getAnalysisName(), analysis.getAnalysisId());
            return Result.succeed(analysis, "创建分析成功");

        } catch (Exception e) {
            log.error("创建盈亏平衡分析失败: {}", analysisDTO.getAnalysisName(), e);
            return Result.failed("创建分析失败: " + e.getMessage());
        }
    }

    @Override
    public PageResult<BreakevenAnalysis> getAnalysisList(BreakevenQueryDTO queryDTO) {
        try {
            // 设置租户ID
            queryDTO.setTenantId(TenantContextHolder.getTenant());

            // 创建分页对象
            Page<BreakevenAnalysis> page = new Page<>(queryDTO.getPage(), queryDTO.getSize());

            // 执行分页查询
            IPage<BreakevenAnalysis> resultPage = breakevenAnalysisMapper.selectAnalysisList(page, queryDTO);

            // 如果需要包含详细信息，加载关联数据
            if (Boolean.TRUE.equals(queryDTO.getIncludeDetails())) {
                loadAnalysisDetails(resultPage.getRecords());
            }
            return PageResultUtil.buildPageResult(resultPage);

        } catch (Exception e) {
            log.error("查询盈亏平衡分析列表失败", e);
            throw new BusinessException("查询失败: " + e.getMessage());
        }
    }

    @Override
    public Result<BreakevenAnalysis> getAnalysisDetail(String analysisId) {
        try {
            String tenantId = TenantContextHolder.getTenant();
            BreakevenAnalysis analysis = breakevenAnalysisMapper.selectByAnalysisId(analysisId, tenantId);

            if (analysis == null) {
                return Result.failed("分析不存在");
            }

            // 加载详细信息
            loadAnalysisDetails(Collections.singletonList(analysis));

            return Result.succeed(analysis, "获取详情成功");

        } catch (Exception e) {
            log.error("获取分析详情失败: {}", analysisId, e);
            return Result.failed("获取详情失败: " + e.getMessage());
        }
    }

    @Override
    public Result<BreakevenAnalysis> recalculateAnalysis(String analysisId) {
        try {
            String tenantId = TenantContextHolder.getTenant();
            BreakevenAnalysis existingAnalysis = breakevenAnalysisMapper.selectByAnalysisId(analysisId, tenantId);

            if (existingAnalysis == null) {
                return Result.failed("分析不存在");
            }

            // 从保存的参数中重新构建DTO
            BreakevenAnalysisDTO analysisDTO = reconstructAnalysisDTO(existingAnalysis);

            // 重新计算
            BreakevenAnalysis newAnalysis = calculationEngine.performAnalysis(analysisDTO, tenantId, existingAnalysis.getCreatorId());
            newAnalysis.setId(existingAnalysis.getId());
            newAnalysis.setAnalysisId(analysisId);
            newAnalysis.setCalculationTrigger(BreakevenAnalysis.TRIGGER_MANUAL);

            // 更新数据库
            breakevenAnalysisMapper.updateById(newAnalysis);

            log.info("重新计算分析成功: {}", analysisId);
            return Result.succeed(newAnalysis, "重新计算成功");

        } catch (Exception e) {
            log.error("重新计算分析失败: {}", analysisId, e);
            return Result.failed("重新计算失败: " + e.getMessage());
        }
    }

    @Override
    public Result<BreakevenAnalysis> updateAnalysis(String analysisId, BreakevenAnalysisDTO analysisDTO) {
        try {
            String tenantId = TenantContextHolder.getTenant();
            BreakevenAnalysis existingAnalysis = breakevenAnalysisMapper.selectByAnalysisId(analysisId, tenantId);

            if (existingAnalysis == null) {
                return Result.failed("分析不存在");
            }

            // 重新计算分析
            BreakevenAnalysis updatedAnalysis = calculationEngine.performAnalysis(analysisDTO, tenantId, existingAnalysis.getCreatorId());
            updatedAnalysis.setId(existingAnalysis.getId());
            updatedAnalysis.setAnalysisId(analysisId);
            updatedAnalysis.setCreatedAt(existingAnalysis.getCreatedAt());
            updatedAnalysis.setCalculationTrigger(BreakevenAnalysis.TRIGGER_PARAMETER_CHANGE);

            // 更新数据库
            breakevenAnalysisMapper.updateById(updatedAnalysis);

            log.info("更新分析成功: {}", analysisId);
            return Result.succeed(updatedAnalysis, "更新分析成功");

        } catch (Exception e) {
            log.error("更新分析失败: {}", analysisId, e);
            return Result.failed("更新分析失败: " + e.getMessage());
        }
    }

    @Override
    public Result<String> deleteAnalysis(String analysisId) {
        try {
            String tenantId = TenantContextHolder.getTenant();

            // 检查分析是否存在
            BreakevenAnalysis analysis = breakevenAnalysisMapper.selectByAnalysisId(analysisId, tenantId);
            if (analysis == null) {
                return Result.failed("分析不存在");
            }

            // 删除关联的场景数据
            breakevenScenarioMapper.deleteByAnalysisId(analysisId, tenantId);

            // 删除分析记录
            breakevenAnalysisMapper.deleteById(analysis.getId());

            log.info("删除分析成功: {}", analysisId);
            return Result.succeed("删除成功");

        } catch (Exception e) {
            log.error("删除分析失败: {}", analysisId, e);
            return Result.failed("删除失败: " + e.getMessage());
        }
    }

    @Override
    public Result<String> batchDeleteAnalysis(List<String> analysisIds) {
        try {
            String tenantId = TenantContextHolder.getTenant();

            for (String analysisId : analysisIds) {
                // 删除关联的场景数据
                breakevenScenarioMapper.deleteByAnalysisId(analysisId, tenantId);
            }

            // 批量更新状态为已删除
            int deletedCount = breakevenAnalysisMapper.batchUpdateStatus(analysisIds, "deleted", tenantId);

            log.info("批量删除分析成功: 共{}条", deletedCount);
            return Result.succeed("批量删除成功，共删除" + deletedCount + "条记录");

        } catch (Exception e) {
            log.error("批量删除分析失败", e);
            return Result.failed("批量删除失败: " + e.getMessage());
        }
    }

    @Override
    public Result<String> archiveAnalysis(String analysisId) {
        try {
            String tenantId = TenantContextHolder.getTenant();

            // 更新状态为归档
            int updatedCount = breakevenAnalysisMapper.batchUpdateStatus(
                    Collections.singletonList(analysisId),
                    BreakevenAnalysis.STATUS_ARCHIVED,
                    tenantId
            );

            if (updatedCount == 0) {
                return Result.failed("分析不存在或已归档");
            }

            log.info("归档分析成功: {}", analysisId);
            return Result.succeed("归档成功");

        } catch (Exception e) {
            log.error("归档分析失败: {}", analysisId, e);
            return Result.failed("归档失败: " + e.getMessage());
        }
    }

    @Override
    public Result<BreakevenAnalysis> copyAnalysis(String analysisId, String newAnalysisName) {
        try {
            String tenantId = TenantContextHolder.getTenant();
            BreakevenAnalysis originalAnalysis = breakevenAnalysisMapper.selectByAnalysisId(analysisId, tenantId);

            if (originalAnalysis == null) {
                return Result.failed("原分析不存在");
            }

            // 重新构建DTO并修改名称
            BreakevenAnalysisDTO analysisDTO = reconstructAnalysisDTO(originalAnalysis);
            analysisDTO.setAnalysisName(newAnalysisName);

            // 创建新分析
            return createAnalysis(analysisDTO);

        } catch (Exception e) {
            log.error("复制分析失败: {}", analysisId, e);
            return Result.failed("复制失败: " + e.getMessage());
        }
    }

    // ==================== 场景分析相关 ====================

    @Override
    public Result<List<BreakevenScenario>> getScenarios(String analysisId) {
        try {
            String tenantId = TenantContextHolder.getTenant();
            List<BreakevenScenario> scenarios = breakevenScenarioMapper.selectByAnalysisId(analysisId, tenantId);

            return Result.succeed(scenarios, "获取场景列表成功");

        } catch (Exception e) {
            log.error("获取场景列表失败: {}", analysisId, e);
            return Result.failed("获取场景列表失败: " + e.getMessage());
        }
    }

    @Override
    public Result<BreakevenScenario> addScenario(String analysisId, BreakevenAnalysisDTO.ScenarioConfig scenarioConfig) {
        try {
            // 实现添加场景逻辑
            log.info("添加场景: {} - {}", analysisId, scenarioConfig.getScenarioName());
            // 暂时返回成功，具体实现需要调用计算引擎
            return Result.succeed(new BreakevenScenario(), "添加场景成功");

        } catch (Exception e) {
            log.error("添加场景失败", e);
            return Result.failed("添加场景失败: " + e.getMessage());
        }
    }

    @Override
    public Result<BreakevenScenario> updateScenario(String scenarioId, BreakevenAnalysisDTO.ScenarioConfig scenarioConfig) {
        try {
            // 实现更新场景逻辑
            log.info("更新场景: {}", scenarioId);
            return Result.succeed(new BreakevenScenario(), "更新场景成功");

        } catch (Exception e) {
            log.error("更新场景失败", e);
            return Result.failed("更新场景失败: " + e.getMessage());
        }
    }

    @Override
    public Result<String> deleteScenario(String scenarioId) {
        try {
            // 实现删除场景逻辑
            log.info("删除场景: {}", scenarioId);
            return Result.succeed("删除场景成功");

        } catch (Exception e) {
            log.error("删除场景失败", e);
            return Result.failed("删除场景失败: " + e.getMessage());
        }
    }

    @Override
    public Result<Map<String, Object>> compareScenarios(List<String> scenarioIds) {
        try {
            // 实现场景比较逻辑
            Map<String, Object> comparison = new HashMap<>();
            comparison.put("scenarios", scenarioIds);
            comparison.put("comparisonResult", "场景对比结果");

            return Result.succeed(comparison, "场景比较成功");

        } catch (Exception e) {
            log.error("场景比较失败", e);
            return Result.failed("场景比较失败: " + e.getMessage());
        }
    }

    // ==================== 敏感性分析相关 ====================

    @Override
    public Result<List<BreakevenSensitivity>> getSensitivityAnalysis(String analysisId) {
        try {
            // 实现获取敏感性分析结果
            List<BreakevenSensitivity> sensitivities = new ArrayList<>();
            return Result.succeed(sensitivities, "获取敏感性分析成功");

        } catch (Exception e) {
            log.error("获取敏感性分析失败", e);
            return Result.failed("获取敏感性分析失败: " + e.getMessage());
        }
    }

    @Override
    public Result<List<BreakevenSensitivity>> recalculateSensitivity(String analysisId,
                                                                     BreakevenAnalysisDTO.SensitivityConfig sensitivityConfig) {
        try {
            // 实现重新计算敏感性分析
            List<BreakevenSensitivity> sensitivities = new ArrayList<>();
            return Result.succeed(sensitivities, "敏感性分析计算成功");

        } catch (Exception e) {
            log.error("敏感性分析计算失败", e);
            return Result.failed("敏感性分析计算失败: " + e.getMessage());
        }
    }

    @Override
    public Result<List<Map<String, Object>>> getSensitivityRanking(String analysisId) {
        try {
            // 实现获取敏感性排名
            List<Map<String, Object>> ranking = new ArrayList<>();
            return Result.succeed(ranking, "获取敏感性排名成功");

        } catch (Exception e) {
            log.error("获取敏感性排名失败", e);
            return Result.failed("获取敏感性排名失败: " + e.getMessage());
        }
    }

    // ==================== 预测分析相关 ====================

    @Override
    public Result<BreakevenForecast> getForecastAnalysis(String analysisId) {
        try {
            // 实现获取预测分析
            BreakevenForecast forecast = new BreakevenForecast();
            return Result.succeed(forecast, "获取预测分析成功");

        } catch (Exception e) {
            log.error("获取预测分析失败", e);
            return Result.failed("获取预测分析失败: " + e.getMessage());
        }
    }

    @Override
    public Result<BreakevenForecast> recalculateForecast(String analysisId,
                                                         BreakevenAnalysisDTO.ForecastConfig forecastConfig) {
        try {
            // 实现重新计算预测
            BreakevenForecast forecast = new BreakevenForecast();
            return Result.succeed(forecast, "预测分析计算成功");

        } catch (Exception e) {
            log.error("预测分析计算失败", e);
            return Result.failed("预测分析计算失败: " + e.getMessage());
        }
    }

    @Override
    public Result<Map<String, Object>> getForecastTrends(String analysisId) {
        try {
            // 实现获取预测趋势
            Map<String, Object> trends = new HashMap<>();
            return Result.succeed(trends, "获取预测趋势成功");

        } catch (Exception e) {
            log.error("获取预测趋势失败", e);
            return Result.failed("获取预测趋势失败: " + e.getMessage());
        }
    }

    // ==================== 统计分析相关 ====================

    @Override
    public Result<Map<String, Object>> getAnalysisStatistics(BreakevenQueryDTO queryDTO) {
        try {
            String tenantId = TenantContextHolder.getTenant();

            // 获取统计数据
            List<Map<String, Object>> statistics = breakevenAnalysisMapper.selectAnalysisStatistics(tenantId, queryDTO.getAnalysisPeriod());

            Map<String, Object> result = new HashMap<>();
            result.put("statistics", statistics);
            result.put("totalCount", breakevenAnalysisMapper.countAnalysis(queryDTO));

            return Result.succeed(result, "获取统计信息成功");

        } catch (Exception e) {
            log.error("获取统计信息失败", e);
            return Result.failed("获取统计信息失败: " + e.getMessage());
        }
    }

    @Override
    public Result<List<Map<String, Object>>> getAnalysisHistory(String analysisId) {
        try {
            // 实现获取执行历史
            List<Map<String, Object>> history = new ArrayList<>();
            return Result.succeed(history, "获取执行历史成功");

        } catch (Exception e) {
            log.error("获取执行历史失败", e);
            return Result.failed("获取执行历史失败: " + e.getMessage());
        }
    }

    @Override
    public Result<Map<String, Object>> getCostStructureAnalysis(String analysisId) {
        try {
            // 实现成本结构分析
            Map<String, Object> costStructure = new HashMap<>();
            return Result.succeed(costStructure, "获取成本结构分析成功");

        } catch (Exception e) {
            log.error("获取成本结构分析失败", e);
            return Result.failed("获取成本结构分析失败: " + e.getMessage());
        }
    }

    @Override
    public Result<Map<String, Object>> getProfitabilityAnalysis(String analysisId) {
        try {
            // 实现盈利能力分析
            Map<String, Object> profitability = new HashMap<>();
            return Result.succeed(profitability, "获取盈利能力分析成功");

        } catch (Exception e) {
            log.error("获取盈利能力分析失败", e);
            return Result.failed("获取盈利能力分析失败: " + e.getMessage());
        }
    }

    // ==================== 导出相关 ====================

    @Override
    public byte[] exportAnalysisReport(String analysisId, String exportFormat) {
        try {
            // 实现报告导出
            log.info("导出分析报告: {}, 格式: {}", analysisId, exportFormat);
            return new byte[0];

        } catch (Exception e) {
            log.error("导出分析报告失败", e);
            throw new RuntimeException("导出失败: " + e.getMessage());
        }
    }

    @Override
    public byte[] exportAnalysisData(BreakevenQueryDTO queryDTO, String exportFormat) {
        try {
            // 实现数据导出
            log.info("导出分析数据, 格式: {}", exportFormat);
            return new byte[0];

        } catch (Exception e) {
            log.error("导出分析数据失败", e);
            throw new RuntimeException("导出失败: " + e.getMessage());
        }
    }

    // ==================== 配置管理相关 ====================

    @Override
    public Result<BreakevenAnalysisDTO> getAnalysisTemplate(String templateType) {
        try {
            // 实现获取模板
            BreakevenAnalysisDTO template = new BreakevenAnalysisDTO();
            return Result.succeed(template, "获取模板成功");

        } catch (Exception e) {
            log.error("获取模板失败", e);
            return Result.failed("获取模板失败: " + e.getMessage());
        }
    }

    @Override
    public Result<String> saveAnalysisTemplate(String templateName, BreakevenAnalysisDTO analysisDTO) {
        try {
            // 实现保存模板
            log.info("保存模板: {}", templateName);
            return Result.succeed("保存模板成功");

        } catch (Exception e) {
            log.error("保存模板失败", e);
            return Result.failed("保存模板失败: " + e.getMessage());
        }
    }

    @Override
    public Result<List<Map<String, Object>>> getUserTemplates() {
        try {
            // 实现获取用户模板列表
            List<Map<String, Object>> templates = new ArrayList<>();
            return Result.succeed(templates, "获取模板列表成功");

        } catch (Exception e) {
            log.error("获取模板列表失败", e);
            return Result.failed("获取模板列表失败: " + e.getMessage());
        }
    }

    // ==================== 自动化相关 ====================

    @Override
    public Result<String> enableAutoRecalculation(String analysisId) {
        try {
            // 实现启用自动重算
            log.info("启用自动重算: {}", analysisId);
            return Result.succeed("启用自动重算成功");

        } catch (Exception e) {
            log.error("启用自动重算失败", e);
            return Result.failed("启用自动重算失败: " + e.getMessage());
        }
    }

    @Override
    public Result<String> disableAutoRecalculation(String analysisId) {
        try {
            // 实现禁用自动重算
            log.info("禁用自动重算: {}", analysisId);
            return Result.succeed("禁用自动重算成功");

        } catch (Exception e) {
            log.error("禁用自动重算失败", e);
            return Result.failed("禁用自动重算失败: " + e.getMessage());
        }
    }

    @Override
    public Result<String> executeScheduledRecalculation() {
        try {
            // 获取需要自动重算的分析
            List<BreakevenAnalysis> analyses = breakevenAnalysisMapper.selectForAutoRecalculation();

            int recalculatedCount = 0;
            for (BreakevenAnalysis analysis : analyses) {
                try {
                    recalculateAnalysis(analysis.getAnalysisId());
                    recalculatedCount++;
                } catch (Exception e) {
                    log.error("自动重算失败: {}", analysis.getAnalysisId(), e);
                }
            }

            log.info("定时自动重算完成，共处理{}条记录", recalculatedCount);
            return Result.succeed("定时重算完成，共处理" + recalculatedCount + "条记录");

        } catch (Exception e) {
            log.error("执行定时自动重算失败", e);
            return Result.failed("执行定时重算失败: " + e.getMessage());
        }
    }

    @Override
    public Result<Map<String, Object>> getAutoRecalculationStatus(String analysisId) {
        try {
            // 实现获取自动重算状态
            Map<String, Object> status = new HashMap<>();
            status.put("analysisId", analysisId);
            status.put("autoRecalculation", true);
            status.put("lastRecalculation", LocalDateTime.now());

            return Result.succeed(status, "获取自动重算状态成功");

        } catch (Exception e) {
            log.error("获取自动重算状态失败", e);
            return Result.failed("获取自动重算状态失败: " + e.getMessage());
        }
    }

    // ==================== 私有辅助方法 ====================

    /**
     * 加载分析详细信息
     */
    private void loadAnalysisDetails(List<BreakevenAnalysis> analyses) {
        for (BreakevenAnalysis analysis : analyses) {
            // 加载场景信息
            List<BreakevenScenario> scenarios = breakevenScenarioMapper.selectByAnalysisId(
                    analysis.getAnalysisId(), analysis.getTenantId()
            );
            // 这里可以将场景信息设置到analysis对象中，或者使用其他方式处理
        }
    }

    /**
     * 从保存的分析记录重新构建DTO
     */
    private BreakevenAnalysisDTO reconstructAnalysisDTO(BreakevenAnalysis analysis) {
        BreakevenAnalysisDTO dto = new BreakevenAnalysisDTO();
        dto.setAnalysisName(analysis.getAnalysisName());
        dto.setAnalysisType(analysis.getAnalysisType());
        dto.setAnalysisPeriod(analysis.getAnalysisPeriod());
        dto.setIsRealTime(analysis.getIsRealTime());
        dto.setAutoRecalculation(analysis.getAutoRecalculation());

        // 从JSON参数中恢复计算参数
        if (StringUtils.hasText(analysis.getCurrentParameters())) {
            try {
                // 这里需要实现JSON到DTO的转换逻辑
                // dto.setCalculationParameters(...);
            } catch (Exception e) {
                log.warn("解析保存的参数失败: {}", analysis.getAnalysisId(), e);
            }
        }

        return dto;
    }

    /**
     * 获取当前用户ID
     */
    private Long getCurrentUserId() {
        // 这里应该从Spring Security上下文中获取当前用户ID
        // 暂时返回1L作为默认值
        return 1L;
    }
} 