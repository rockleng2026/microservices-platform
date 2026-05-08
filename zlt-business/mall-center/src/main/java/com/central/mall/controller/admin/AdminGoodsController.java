package com.central.mall.controller.admin;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.central.common.model.Result;
import com.central.mall.model.dto.AdminGoodsDTO;
import com.central.mall.model.dto.BatchStatusDTO;
import com.central.mall.model.dto.GoodsCloneDTO;
import com.central.mall.service.IAdminGoodsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/mall/admin/goods")
@RequiredArgsConstructor
@Tag(name = "管理员-商品管理")
@Validated
public class AdminGoodsController {

    private final IAdminGoodsService adminGoodsService;

    @GetMapping("/list")
    @Operation(summary = "商品列表（分页）")
    public Result<IPage<AdminGoodsDTO>> getGoodsPage(
            @RequestParam(defaultValue = "1") Long page,
            @RequestParam(defaultValue = "20") Long pageSize,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Integer goodsType) {
        IPage<AdminGoodsDTO> result = adminGoodsService.getGoodsPage(
                new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(page, pageSize),
                Map.of(
                        "categoryId", categoryId != null ? categoryId : "",
                        "keyword", keyword != null ? keyword : "",
                        "status", status != null ? status : "",
                        "goodsType", goodsType != null ? goodsType : ""
                )
        );
        return Result.succeed(result);
    }

    @GetMapping("/{id}")
    @Operation(summary = "商品详情")
    public Result<AdminGoodsDTO> getGoodsDetail(@PathVariable Long id) {
        AdminGoodsDTO goods = adminGoodsService.getGoodsDetail(id);
        if (goods == null) {
            return Result.failed("商品不存在");
        }
        return Result.succeed(goods);
    }

    @PostMapping
    @Operation(summary = "发布商品")
    public Result<Boolean> publishGoods(@RequestBody @Validated AdminGoodsDTO dto) {
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            return Result.failed("商品名称不能为空");
        }
        if (dto.getCategoryId() == null) {
            return Result.failed("分类ID不能为空");
        }
        if (dto.getGoodsType() == null || (dto.getGoodsType() != 1 && dto.getGoodsType() != 2)) {
            return Result.failed("商品类型必须为1（实物）或2（虚拟）");
        }
        if (dto.getPrice() == null) {
            return Result.failed("价格不能为空");
        }
        boolean result = adminGoodsService.publishGoods(dto);
        return result ? Result.succeed(true, "商品发布成功") : Result.failed("商品发布失败");
    }

    @PutMapping
    @Operation(summary = "更新商品")
    public Result<Boolean> updateGoods(@RequestBody @Validated AdminGoodsDTO dto) {
        if (dto.getId() == null) {
            return Result.failed("商品ID不能为空");
        }
        boolean result = adminGoodsService.updateGoods(dto);
        return result ? Result.succeed(true, "商品更新成功") : Result.failed("商品更新失败");
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除商品（软删除）")
    public Result<Boolean> deleteGoods(@PathVariable Long id) {
        boolean result = adminGoodsService.deleteGoods(id);
        return result ? Result.succeed(true, "商品删除成功") : Result.failed("商品删除失败");
    }

    @PutMapping("/{id}/status/{status}")
    @Operation(summary = "更新商品状态")
    public Result<Boolean> updateStatus(@PathVariable Long id, @PathVariable @NotNull Integer status) {
        boolean result = adminGoodsService.updateStatus(id, status);
        return result ? Result.succeed(true, "状态更新成功") : Result.failed("状态更新失败");
    }

    @PutMapping("/batch/status")
    @Operation(summary = "批量更新商品状态")
    public Result<Boolean> batchUpdateStatus(@RequestBody @Validated BatchStatusDTO dto) {
        if (dto.getGoodsIds() == null || dto.getGoodsIds().isEmpty()) {
            return Result.failed("商品ID列表不能为空");
        }
        if (dto.getStatus() == null) {
            return Result.failed("状态值不能为空");
        }
        boolean result = adminGoodsService.batchUpdateStatus(dto.getGoodsIds(), dto.getStatus());
        return result ? Result.succeed(true, "批量状态更新成功") : Result.failed("批量状态更新失败");
    }

    @PostMapping("/clone")
    @Operation(summary = "克隆商品")
    public Result<Long> cloneGoods(@RequestBody @Validated GoodsCloneDTO dto) {
        if (dto.getGoodsId() == null) {
            return Result.failed("原商品ID不能为空");
        }
        Long newGoodsId = adminGoodsService.cloneGoods(dto.getGoodsId(), dto.getNewCategoryId(), dto.getNewName());
        if (newGoodsId == null) {
            return Result.failed("商品克隆失败");
        }
        return Result.succeed(newGoodsId, "商品克隆成功");
    }
}
