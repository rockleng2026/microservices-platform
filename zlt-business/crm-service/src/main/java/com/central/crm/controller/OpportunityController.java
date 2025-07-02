package com.central.crm.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.common.model.Result;
import com.central.crm.model.Opportunity;
import com.central.crm.service.OpportunityService;
import com.central.crm.model.vo.OpportunityQueryVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 商机管理Controller
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Slf4j
@RestController
@RequestMapping("/api/opportunity")
@Tag(name = "商机管理", description = "商机管理相关接口")
@Validated
public class OpportunityController {

    @Autowired
    private OpportunityService opportunityService;

    /**
     * 分页查询商机列表
     */
    @PostMapping("/page")
    @Operation(summary = "分页查询商机列表")
    public Result<IPage<Opportunity>> getOpportunityPage(@RequestBody OpportunityQueryVO vo) {
        try {
            Page<Opportunity> pageParam = new Page<>(vo.getPage(), vo.getSize());
            Map<String, Object> params = new HashMap<>();
            if (vo.getOpportunityName() != null) params.put("opportunityName", vo.getOpportunityName());
            if (vo.getCustomerId() != null) params.put("customerId", vo.getCustomerId());
            if (vo.getStage() != null) params.put("stage", vo.getStage());
            if (vo.getOpportunitySource() != null) params.put("opportunitySource", vo.getOpportunitySource());
            if (vo.getOwnerEmployeeId() != null) params.put("ownerEmployeeId", vo.getOwnerEmployeeId());
            if (vo.getStartDate() != null) params.put("startDate", vo.getStartDate());
            if (vo.getEndDate() != null) params.put("endDate", vo.getEndDate());
            
            IPage<Opportunity> pageResult = opportunityService.selectOpportunityPage(pageParam, params);
            return Result.succeed(pageResult);
        } catch (Exception e) {
            log.error("分页查询商机列表失败", e);
            return Result.failed("分页查询商机列表失败: " + e.getMessage());
        }
    }

    /**
     * 根据ID查询商机详情
     */
    @GetMapping("/{id}")
    @Operation(summary = "根据ID查询商机详情")
    public Result<Opportunity> getOpportunityById(@PathVariable Long id) {
        try {
            Opportunity opportunity = opportunityService.getById(id);
            return Result.succeed(opportunity);
        } catch (Exception e) {
            log.error("查询商机详情失败", e);
            return Result.failed("查询商机详情失败: " + e.getMessage());
        }
    }

    /**
     * 创建商机
     */
    @PostMapping
    @Operation(summary = "创建商机")
    public Result<String> createOpportunity(@Valid @RequestBody Opportunity opportunity) {
        try {
            boolean success = opportunityService.createOpportunity(opportunity);
            return success ? Result.succeed("创建成功") : Result.failed("创建失败");
        } catch (Exception e) {
            log.error("创建商机失败", e);
            return Result.failed("创建商机失败: " + e.getMessage());
        }
    }

    /**
     * 更新商机
     */
    @PutMapping
    @Operation(summary = "更新商机")
    public Result<String> updateOpportunity(@Valid @RequestBody Opportunity opportunity) {
        try {
            boolean success = opportunityService.updateOpportunity(opportunity);
            return success ? Result.succeed("更新成功") : Result.failed("更新失败");
        } catch (Exception e) {
            log.error("更新商机失败", e);
            return Result.failed("更新商机失败: " + e.getMessage());
        }
    }

    /**
     * 删除商机
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除商机")
    public Result<String> deleteOpportunity(@PathVariable Long id) {
        try {
            boolean success = opportunityService.deleteOpportunity(id);
            return success ? Result.succeed("删除成功") : Result.failed("删除失败");
        } catch (Exception e) {
            log.error("删除商机失败", e);
            return Result.failed("删除商机失败: " + e.getMessage());
        }
    }

    /**
     * 批量删除商机
     */
    @DeleteMapping("/batch")
    @Operation(summary = "批量删除商机")
    public Result<String> batchDeleteOpportunities(@RequestBody List<Long> ids) {
        try {
            boolean success = opportunityService.batchDeleteOpportunities(ids);
            return success ? Result.succeed("批量删除成功") : Result.failed("批量删除失败");
        } catch (Exception e) {
            log.error("批量删除商机失败", e);
            return Result.failed("批量删除商机失败: " + e.getMessage());
        }
    }

    /**
     * 根据客户ID查询商机列表
     */
    @GetMapping("/customer/{customerId}")
    @Operation(summary = "根据客户ID查询商机列表")
    public Result<List<Opportunity>> getByCustomerId(@PathVariable Long customerId) {
        try {
            List<Opportunity> opportunities = opportunityService.getByCustomerId(customerId);
            return Result.succeed(opportunities);
        } catch (Exception e) {
            log.error("查询客户商机失败", e);
            return Result.failed("查询客户商机失败: " + e.getMessage());
        }
    }

    /**
     * 查询商机漏斗统计
     */
    @PostMapping("/funnel-statistics")
    @Operation(summary = "查询商机漏斗统计")
    public Result<List<Map<String, Object>>> getFunnelStatistics(@RequestBody OpportunityQueryVO vo) {
        try {
            Map<String, Object> params = new HashMap<>();
            if (vo.getStartDate() != null) params.put("startDate", vo.getStartDate());
            if (vo.getEndDate() != null) params.put("endDate", vo.getEndDate());
            if (vo.getOwnerEmployeeId() != null) params.put("ownerEmployeeId", vo.getOwnerEmployeeId());
            
            List<Map<String, Object>> funnel = opportunityService.getFunnelStatistics(params);
            return Result.succeed(funnel);
        } catch (Exception e) {
            log.error("查询商机漏斗统计失败", e);
            return Result.failed("查询商机漏斗统计失败: " + e.getMessage());
        }
    }

    /**
     * 查询商机成交统计
     */
    @PostMapping("/win-statistics")
    @Operation(summary = "查询商机成交统计")
    public Result<Map<String, Object>> getWinStatistics(@RequestBody OpportunityQueryVO vo) {
        try {
            Map<String, Object> params = new HashMap<>();
            if (vo.getStartDate() != null) params.put("startDate", vo.getStartDate());
            if (vo.getEndDate() != null) params.put("endDate", vo.getEndDate());
            if (vo.getOwnerEmployeeId() != null) params.put("ownerEmployeeId", vo.getOwnerEmployeeId());
            
            Map<String, Object> stats = opportunityService.getWinStatistics(params);
            return Result.succeed(stats);
        } catch (Exception e) {
            log.error("查询商机成交统计失败", e);
            return Result.failed("查询商机成交统计失败: " + e.getMessage());
        }
    }

    /**
     * 查询商机趋势统计
     */
    @PostMapping("/trend-statistics")
    @Operation(summary = "查询商机趋势统计")
    public Result<List<Map<String, Object>>> getTrendStatistics(@RequestBody OpportunityQueryVO vo) {
        try {
            Map<String, Object> params = new HashMap<>();
            if (vo.getStartDate() != null) params.put("startDate", vo.getStartDate());
            if (vo.getEndDate() != null) params.put("endDate", vo.getEndDate());
            params.put("granularity", vo.getGranularity() != null ? vo.getGranularity() : "month");
            
            List<Map<String, Object>> trend = opportunityService.getTrendStatistics(params);
            return Result.succeed(trend);
        } catch (Exception e) {
            log.error("查询商机趋势统计失败", e);
            return Result.failed("查询商机趋势统计失败: " + e.getMessage());
        }
    }

    /**
     * 推进商机阶段
     */
    @PutMapping("/{id}/advance")
    @Operation(summary = "推进商机阶段")
    public Result<String> advanceOpportunityStage(@PathVariable Long id, @RequestBody OpportunityQueryVO vo) {
        try {
            boolean success = opportunityService.advanceOpportunityStage(id, vo.getNewStage(), vo.getNewProbability(), vo.getNotes());
            return success ? Result.succeed("推进成功") : Result.failed("推进失败");
        } catch (Exception e) {
            log.error("推进商机阶段失败", e);
            return Result.failed("推进商机阶段失败: " + e.getMessage());
        }
    }

    /**
     * 成交商机
     */
    @PutMapping("/{id}/win")
    @Operation(summary = "成交商机")
    public Result<String> winOpportunity(@PathVariable Long id, @RequestBody OpportunityQueryVO vo) {
        try {
            boolean success = opportunityService.winOpportunity(id, vo.getActualAmount(), vo.getWinReason(), vo.getNotes());
            return success ? Result.succeed("成交成功") : Result.failed("成交失败");
        } catch (Exception e) {
            log.error("成交商机失败", e);
            return Result.failed("成交商机失败: " + e.getMessage());
        }
    }

    /**
     * 失败商机
     */
    @PutMapping("/{id}/lose")
    @Operation(summary = "失败商机")
    public Result<String> loseOpportunity(@PathVariable Long id, @RequestBody OpportunityQueryVO vo) {
        try {
            boolean success = opportunityService.loseOpportunity(id, vo.getLoseReason(), vo.getNotes());
            return success ? Result.succeed("操作成功") : Result.failed("操作失败");
        } catch (Exception e) {
            log.error("失败商机操作失败", e);
            return Result.failed("失败商机操作失败: " + e.getMessage());
        }
    }

    /**
     * 查询我的商机
     */
    @PostMapping("/my-opportunities")
    @Operation(summary = "查询我的商机")
    public Result<List<Opportunity>> getMyOpportunities(@RequestBody OpportunityQueryVO vo) {
        try {
            List<Opportunity> opportunities = opportunityService.getMyOpportunities(vo.getOwnerEmployeeId(), vo.getStage());
            return Result.succeed(opportunities);
        } catch (Exception e) {
            log.error("查询我的商机失败", e);
            return Result.failed("查询我的商机失败: " + e.getMessage());
        }
    }

    /**
     * 查询即将到期的商机
     */
    @PostMapping("/expiring")
    @Operation(summary = "查询即将到期的商机")
    public Result<List<Opportunity>> getExpiringOpportunities(@RequestBody OpportunityQueryVO vo) {
        try {
            List<Opportunity> opportunities = opportunityService.getExpiringOpportunities(vo.getDays() != null ? vo.getDays() : 30, vo.getOwnerEmployeeId());
            return Result.succeed(opportunities);
        } catch (Exception e) {
            log.error("查询即将到期商机失败", e);
            return Result.failed("查询即将到期商机失败: " + e.getMessage());
        }
    }

    /**
     * 克隆商机
     */
    @PostMapping("/{id}/clone")
    @Operation(summary = "克隆商机")
    public Result<String> cloneOpportunity(@PathVariable Long id, @RequestBody OpportunityQueryVO vo) {
        try {
            boolean success = opportunityService.cloneOpportunity(id, vo.getNewOpportunityName());
            return success ? Result.succeed("克隆成功") : Result.failed("克隆失败");
        } catch (Exception e) {
            log.error("克隆商机失败", e);
            return Result.failed("克隆商机失败: " + e.getMessage());
        }
    }

    /**
     * 导入商机数据
     */
    @PostMapping("/import")
    @Operation(summary = "导入商机数据")
    public Result<Map<String, Object>> importOpportunities(@RequestBody List<Opportunity> opportunities) {
        try {
            Map<String, Object> result = opportunityService.importOpportunities(opportunities);
            return Result.succeed(result);
        } catch (Exception e) {
            log.error("导入商机数据失败", e);
            return Result.failed("导入商机数据失败: " + e.getMessage());
        }
    }

    /**
     * 导出商机数据
     */
    @PostMapping("/export")
    @Operation(summary = "导出商机数据")
    public Result<List<Opportunity>> exportOpportunities(@RequestBody Map<String, Object> params) {
        try {
            List<Opportunity> opportunities = opportunityService.exportOpportunities(params);
            return Result.succeed(opportunities);
        } catch (Exception e) {
            log.error("导出商机数据失败", e);
            return Result.failed("导出商机数据失败: " + e.getMessage());
        }
    }

    /**
     * 获取商机销售阶段配置
     */
    @GetMapping("/sales-stages")
    @Operation(summary = "获取商机销售阶段配置")
    public Result<List<Map<String, Object>>> getSalesStages() {
        try {
            List<Map<String, Object>> stages = opportunityService.getSalesStages();
            return Result.succeed(stages);
        } catch (Exception e) {
            log.error("获取销售阶段配置失败", e);
            return Result.failed("获取销售阶段配置失败: " + e.getMessage());
        }
    }
}