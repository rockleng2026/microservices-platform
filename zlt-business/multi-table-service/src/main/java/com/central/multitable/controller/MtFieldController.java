package com.central.multitable.controller;

import com.central.common.model.Result;
import com.central.multitable.model.MtField;
import com.central.multitable.service.IMtFieldService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 字段管理Controller
 *
 * @author multi-table-system
 */
@Slf4j
@RestController
@RequestMapping("/fields")
@Tag(name = "字段管理", description = "字段管理相关接口")
public class MtFieldController {
    
    @Autowired
    private IMtFieldService fieldService;
    
    @Operation(summary = "根据表格ID查询字段列表")
    @GetMapping("/table/{tableId}")
    public Result<List<MtField>> findByTableId(@PathVariable Long tableId) {
        List<MtField> fields = fieldService.findByTableId(tableId);
        return Result.succeed(fields);
    }
    
    @Operation(summary = "根据ID查询字段")
    @GetMapping("/{id}")
    public Result<MtField> findById(@PathVariable Long id) {
        MtField field = fieldService.getById(id);
        if (field == null) {
            return Result.failed("字段不存在");
        }
        return Result.succeed(field);
    }
    
    @Operation(summary = "创建字段")
    @PostMapping
    public Result<String> create(@RequestBody MtField field) {
        boolean success = fieldService.createField(field);
        if (success) {
            return Result.succeed("创建成功");
        }
        return Result.failed("创建失败");
    }
    
    @Operation(summary = "更新字段")
    @PutMapping("/{id}")
    public Result<String> update(@PathVariable Long id, @RequestBody MtField field) {
        field.setId(id);
        boolean success = fieldService.updateField(field);
        if (success) {
            return Result.succeed("更新成功");
        }
        return Result.failed("更新失败");
    }
    
    @Operation(summary = "删除字段")
    @DeleteMapping("/{id}")
    public Result<String> delete(@PathVariable Long id) {
        boolean success = fieldService.deleteField(id);
        if (success) {
            return Result.succeed("删除成功");
        }
        return Result.failed("删除失败");
    }
    
    @Operation(summary = "批量创建字段")
    @PostMapping("/batch")
    public Result<String> batchCreate(@RequestBody List<MtField> fields) {
        boolean success = fieldService.batchCreateFields(fields);
        if (success) {
            return Result.succeed("批量创建成功");
        }
        return Result.failed("批量创建失败");
    }
    
    @Operation(summary = "更新字段排序")
    @PutMapping("/orders")
    public Result<String> updateOrders(@RequestBody List<Map<String, Object>> fieldOrders) {
        boolean success = fieldService.updateFieldOrders(fieldOrders);
        if (success) {
            return Result.succeed("排序更新成功");
        }
        return Result.failed("排序更新失败");
    }
}