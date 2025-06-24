package com.central.project.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.central.common.model.Result;
import com.central.project.model.ProductProfitDistributionGuide;
import com.central.project.model.dto.ProductProfitDistributionGuideQueryDTO;
import com.central.project.model.dto.ProductProfitDistributionGuideSaveDTO;
import com.central.project.service.IProductProfitDistributionGuideService;
import com.central.project.utils.IdUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * 产品毛利分配指导Controller
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Slf4j
@RestController
@RequestMapping("/api/project/profit-guide")
@Tag(name = "产品毛利分配指导", description = "产品毛利分配指导相关接口")
@Validated
public class ProductProfitDistributionGuideController {
    
    @Autowired
    private IProductProfitDistributionGuideService guideService;
    
    /**
     * 分页查询分配指导列表
     * @param queryDTO 查询条件
     * @return 分配指导分页列表
     */
    @GetMapping("/page")
    @Operation(summary = "分页查询分配指导列表", description = "支持多条件查询和排序")
    public Result<IPage<ProductProfitDistributionGuide>> getGuidePage(@Valid ProductProfitDistributionGuideQueryDTO queryDTO) {
        try {
            IPage<ProductProfitDistributionGuide> page = guideService.getGuidePage(queryDTO);
            return Result.succeed(page);
        } catch (Exception e) {
            log.error("分页查询分配指导列表失败", e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 根据ID查询分配指导详情
     * @param id 分配指导ID
     * @return 分配指导详情
     */
    @GetMapping("/{id}")
    @Operation(summary = "查询分配指导详情", description = "根据ID查询分配指导详细信息")
    public Result<ProductProfitDistributionGuide> getGuideById(
            @Parameter(description = "分配指导ID") @PathVariable("id") String id) {
        try {
            Long guideId = IdUtils.stringToLong(id);
            if (guideId == null) {
                return Result.failed("分配指导ID格式错误");
            }
            
            ProductProfitDistributionGuide guide = guideService.getById(guideId);
            if (guide == null) {
                return Result.failed("分配指导不存在");
            }
            
            return Result.succeed(guide);
        } catch (Exception e) {
            log.error("查询分配指导详情失败，ID: {}", id, e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 新增分配指导
     * @param saveDTO 分配指导数据
     * @return 操作结果
     */
    @PostMapping
    @Operation(summary = "新增分配指导", description = "创建新的分配指导")
    public Result<ProductProfitDistributionGuide> createGuide(@Valid @RequestBody ProductProfitDistributionGuideSaveDTO saveDTO) {
        try {
            // 检查是否已存在相同产品和角色的有效配置
            if (guideService.existsActiveConfig(saveDTO.getProductName(), saveDTO.getRole(), null)) {
                return Result.failed("该产品和角色已存在有效的分配配置");
            }
            
            ProductProfitDistributionGuide guide = guideService.saveGuide(saveDTO);
            return Result.succeed(guide, "分配指导创建成功");
        } catch (Exception e) {
            log.error("新增分配指导失败", e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 修改分配指导
     * @param id 分配指导ID
     * @param saveDTO 分配指导数据
     * @return 操作结果
     */
    @PutMapping("/{id}")
    @Operation(summary = "修改分配指导", description = "根据ID修改分配指导信息")
    public Result<ProductProfitDistributionGuide> updateGuide(
            @Parameter(description = "分配指导ID") @PathVariable("id") String id,
            @Valid @RequestBody ProductProfitDistributionGuideSaveDTO saveDTO) {
        try {
            Long guideId = IdUtils.stringToLong(id);
            if (guideId == null) {
                return Result.failed("分配指导ID格式错误");
            }
            
            // 检查分配指导是否存在
            ProductProfitDistributionGuide existGuide = guideService.getById(guideId);
            if (existGuide == null) {
                return Result.failed("分配指导不存在");
            }
            
            // 检查是否已存在相同产品和角色的有效配置（排除当前记录）
            if (guideService.existsActiveConfig(saveDTO.getProductName(), saveDTO.getRole(), guideId)) {
                return Result.failed("该产品和角色已存在有效的分配配置");
            }
            
            saveDTO.setId(guideId);
            ProductProfitDistributionGuide guide = guideService.saveGuide(saveDTO);
            return Result.succeed(guide, "分配指导修改成功");
        } catch (Exception e) {
            log.error("修改分配指导失败，ID: {}", id, e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 删除分配指导
     * @param id 分配指导ID
     * @return 操作结果
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除分配指导", description = "根据ID删除分配指导（软删除）")
    public Result<Boolean> deleteGuide(
            @Parameter(description = "分配指导ID") @PathVariable("id") String id) {
        try {
            Long guideId = IdUtils.stringToLong(id);
            if (guideId == null) {
                return Result.failed("分配指导ID格式错误");
            }
            
            Boolean result = guideService.deleteGuide(guideId);
            return result ? Result.succeed(true, "分配指导删除成功") : Result.failed("分配指导删除失败");
        } catch (Exception e) {
            log.error("删除分配指导失败，ID: {}", id, e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 批量删除分配指导
     * @param ids 分配指导ID列表
     * @return 操作结果
     */
    @DeleteMapping("/batch")
    @Operation(summary = "批量删除分配指导", description = "批量删除多个分配指导")
    public Result<Boolean> batchDeleteGuides(@RequestBody List<String> ids) {
        try {
            if (ids == null || ids.isEmpty()) {
                return Result.failed("请选择要删除的分配指导");
            }
            
            List<Long> guideIds = ids.stream()
                    .map(IdUtils::stringToLong)
                    .filter(id -> id != null)
                    .toList();
            
            if (guideIds.isEmpty()) {
                return Result.failed("分配指导ID格式错误");
            }
            
            Boolean result = guideService.batchDeleteGuides(guideIds);
            return result ? Result.succeed(true, "批量删除成功") : Result.failed("批量删除失败");
        } catch (Exception e) {
            log.error("批量删除分配指导失败", e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 更新分配指导状态
     * @param id 分配指导ID
     * @param status 新状态
     * @return 操作结果
     */
    @PutMapping("/{id}/status")
    @Operation(summary = "更新分配指导状态", description = "更改分配指导的状态")
    public Result<Boolean> updateGuideStatus(
            @Parameter(description = "分配指导ID") @PathVariable("id") String id,
            @Parameter(description = "新状态") @RequestParam String status) {
        try {
            Long guideId = IdUtils.stringToLong(id);
            if (guideId == null) {
                return Result.failed("分配指导ID格式错误");
            }
            
            Boolean result = guideService.updateGuideStatus(guideId, status);
            return result ? Result.succeed(true, "状态更新成功") : Result.failed("状态更新失败");
        } catch (Exception e) {
            log.error("更新分配指导状态失败，ID: {}, status: {}", id, status, e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 根据产品查询有效的分配指导
     * @param productName 产品名称
     * @param role 角色
     * @return 分配指导
     */
    @GetMapping("/active")
    @Operation(summary = "查询有效的分配指导", description = "根据产品信息查询当前有效的分配指导")
    public Result<ProductProfitDistributionGuide> getActiveGuideByProduct(
            @Parameter(description = "产品名称") @RequestParam String productName,
            @Parameter(description = "角色") @RequestParam String role) {
        try {
            ProductProfitDistributionGuide guide = guideService.getActiveGuideByProduct(productName, role);
            return Result.succeed(guide);
        } catch (Exception e) {
            log.error("查询有效分配指导失败，productName: {}, role: {}", productName, role, e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 根据产品名称查询分配指导列表
     * @param productName 产品名称
     * @return 分配指导列表
     */
    @GetMapping("/product/{productName}")
    @Operation(summary = "按产品查询分配指导", description = "根据产品名称查询分配指导列表")
    public Result<List<ProductProfitDistributionGuide>> getGuidesByProductName(
            @Parameter(description = "产品名称") @PathVariable String productName) {
        try {
            List<ProductProfitDistributionGuide> guides = guideService.getGuidesByProductName(productName);
            return Result.succeed(guides);
        } catch (Exception e) {
            log.error("按产品查询分配指导失败，productName: {}", productName, e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 查询所有有效的分配指导
     * @return 分配指导列表
     */
    @GetMapping("/active/all")
    @Operation(summary = "查询所有有效分配指导", description = "查询当前所有有效的分配指导")
    public Result<List<ProductProfitDistributionGuide>> getAllActiveGuides() {
        try {
            List<ProductProfitDistributionGuide> guides = guideService.getAllActiveGuides();
            return Result.succeed(guides);
        } catch (Exception e) {
            log.error("查询所有有效分配指导失败", e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 查询产品名称列表
     * @return 产品名称列表
     */
    @GetMapping("/products")
    @Operation(summary = "查询产品名称列表", description = "获取所有产品名称")
    public Result<List<String>> getProductNames() {
        try {
            List<String> productNames = guideService.getDistinctProductNames();
            return Result.succeed(productNames);
        } catch (Exception e) {
            log.error("查询产品名称列表失败", e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 查询角色列表
     * @return 角色列表
     */
    @GetMapping("/roles")
    @Operation(summary = "查询角色列表", description = "获取所有角色")
    public Result<List<String>> getRoles() {
        try {
            List<String> roles = guideService.getDistinctRoles();
            return Result.succeed(roles);
        } catch (Exception e) {
            log.error("查询角色列表失败", e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 根据角色查询分配指导列表
     * @param role 角色
     * @return 分配指导列表
     */
    @GetMapping("/role/{role}")
    @Operation(summary = "按角色查询分配指导", description = "根据角色查询分配指导列表")
    public Result<List<ProductProfitDistributionGuide>> getGuidesByRole(
            @Parameter(description = "角色") @PathVariable String role) {
        try {
            List<ProductProfitDistributionGuide> guides = guideService.getGuidesByRole(role);
            return Result.succeed(guides);
        } catch (Exception e) {
            log.error("按角色查询分配指导失败，role: {}", role, e);
            return Result.failed(e.getMessage());
        }
    }
} 