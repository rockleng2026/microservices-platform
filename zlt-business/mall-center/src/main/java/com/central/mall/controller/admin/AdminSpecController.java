package com.central.mall.controller.admin;

import com.central.common.model.Result;
import com.central.mall.model.dto.SpecDTO;
import com.central.mall.service.IAdminSpecService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mall/admin/spec")
@RequiredArgsConstructor
@Tag(name = "管理员-SKU规格管理")
public class AdminSpecController {

    private final IAdminSpecService adminSpecService;

    @GetMapping("/list")
    @Operation(summary = "获取规格列表（含规格值）")
    public Result<List<SpecDTO>> getSpecList() {
        List<SpecDTO> specList = adminSpecService.getSpecList();
        return Result.success(specList);
    }

    @PostMapping
    @Operation(summary = "新增规格")
    public Result<Long> addSpec(@RequestBody Map<String, String> params) {
        String specName = params.get("specName");
        if (specName == null || specName.trim().isEmpty()) {
            return Result.failed("规格名称不能为空");
        }
        Long specId = adminSpecService.addSpec(specName.trim());
        return Result.success(specId, "规格添加成功");
    }

    @PostMapping("/value")
    @Operation(summary = "新增规格值")
    public Result<Long> addSpecValue(@RequestBody Map<String, Object> params) {
        Object specIdObj = params.get("specId");
        String specValue = (String) params.get("specValue");

        if (specIdObj == null) {
            return Result.failed("规格ID不能为空");
        }
        if (specValue == null || specValue.trim().isEmpty()) {
            return Result.failed("规格值不能为空");
        }

        Long specId;
        if (specIdObj instanceof Integer) {
            specId = ((Integer) specIdObj).longValue();
        } else if (specIdObj instanceof Long) {
            specId = (Long) specIdObj;
        } else {
            specId = Long.parseLong(specIdObj.toString());
        }

        Long valueId = adminSpecService.addSpecValue(specId, specValue.trim());
        return Result.success(valueId, "规格值添加成功");
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除规格（同时删除所有规格值）")
    public Result<Boolean> deleteSpec(@PathVariable Long id) {
        boolean result = adminSpecService.deleteSpec(id);
        return result ? Result.success(true, "规格删除成功") : Result.failed("规格删除失败");
    }

    @DeleteMapping("/value/{id}")
    @Operation(summary = "删除单个规格值")
    public Result<Boolean> deleteSpecValue(@PathVariable Long id) {
        boolean result = adminSpecService.deleteSpecValue(id);
        return result ? Result.success(true, "规格值删除成功") : Result.failed("规格值删除失败");
    }
}
