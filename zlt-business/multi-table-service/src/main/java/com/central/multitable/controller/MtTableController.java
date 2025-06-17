package com.central.multitable.controller;

import com.central.common.model.PageResult;
import com.central.common.model.Result;
import com.central.multitable.model.MtTable;
import com.central.multitable.model.dto.TableQueryDTO;
import com.central.multitable.service.IMtTableService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 表格管理Controller
 *
 * @author multi-table-system
 */
@Slf4j
@RestController
@RequestMapping("/api/tables")
@Tag(name = "表格管理", description = "表格管理相关接口")
public class MtTableController {
    
    @Autowired
    private IMtTableService tableService;
    
    @Operation(summary = "分页查询表格列表")
    @GetMapping
    public PageResult<MtTable> findList(TableQueryDTO queryDTO) {
        return tableService.findList(queryDTO);
    }
    
    @Operation(summary = "根据ID查询表格")
    @GetMapping("/{id}")
    public Result<MtTable> findById(@PathVariable Long id) {
        MtTable table = tableService.getById(id);
        if (table == null) {
            return Result.failed("表格不存在");
        }
        return Result.succeed(table);
    }
    
    @Operation(summary = "根据团队ID查询表格")
    @GetMapping("/team/{teamId}")
    public Result<List<MtTable>> findByTeamId(@PathVariable Long teamId) {
        List<MtTable> tables = tableService.findByTeamId(teamId);
        return Result.succeed(tables);
    }
    
    @Operation(summary = "创建表格")
    @PostMapping
    public Result<String> create(@RequestBody MtTable table) {
        boolean success = tableService.createTable(table);
        if (success) {
            return Result.succeed("创建成功");
        }
        return Result.failed("创建失败");
    }
    
    @Operation(summary = "更新表格")
    @PutMapping("/{id}")
    public Result<String> update(@PathVariable Long id, @RequestBody MtTable table) {
        table.setId(id);
        boolean success = tableService.updateTable(table);
        if (success) {
            return Result.succeed("更新成功");
        }
        return Result.failed("更新失败");
    }
    
    @Operation(summary = "删除表格")
    @DeleteMapping("/{id}")
    public Result<String> delete(@PathVariable Long id) {
        boolean success = tableService.deleteTable(id);
        if (success) {
            return Result.succeed("删除成功");
        }
        return Result.failed("删除失败");
    }
    
    @Operation(summary = "复制表格")
    @PostMapping("/{id}/copy")
    public Result<MtTable> copy(@PathVariable Long id, @RequestParam String name) {
        try {
            MtTable newTable = tableService.copyTable(id, name);
            return Result.succeed(newTable);
        } catch (Exception e) {
            log.error("复制表格失败", e);
            return Result.failed("复制失败: " + e.getMessage());
        }
    }
} 