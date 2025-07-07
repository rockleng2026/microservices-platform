package com.central.soo.controller;

import com.central.common.model.Result;
import com.central.soo.model.MonthlyPerformance;
import com.central.soo.service.IMonthlyPerformanceService;
import com.central.soo.utils.PageResultUtil;
import com.central.common.model.PageResult;
import com.central.common.exception.BusinessException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.core.io.ByteArrayResource;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/soo/monthly-performance")
@Tag(name = "月度绩效管理")
public class MonthlyPerformanceController {

    @Autowired
    private IMonthlyPerformanceService monthlyPerformanceService;

    @GetMapping
    @Operation(summary = "获取月度绩效列表")
    public Result<List<MonthlyPerformance>> list() {
        List<MonthlyPerformance> list = monthlyPerformanceService.list();
        return Result.succeed(list);
    }

    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取月度绩效")
    public Result<MonthlyPerformance> getById(@PathVariable Long id) {
        MonthlyPerformance mp = monthlyPerformanceService.getById(id);
        if (mp == null) throw new BusinessException("未找到对应的月度绩效记录", 404);
        return Result.succeed(mp);
    }

    @PostMapping
    @Operation(summary = "新增月度绩效")
    public Result<Void> add(@RequestBody MonthlyPerformance config) {
        boolean unique = monthlyPerformanceService.checkUnique(config.getEmployeeId(), config.getMonth(), null);
        if (!unique) throw new BusinessException("同一员工、同一月份已存在绩效记录", 400);
        boolean saved = monthlyPerformanceService.save(config);
        if (!saved) throw new BusinessException("保存失败", 500);
        return Result.succeed(null);
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新月度绩效")
    public Result<Void> update(@PathVariable Long id, @RequestBody MonthlyPerformance config) {
        boolean unique = monthlyPerformanceService.checkUnique(config.getEmployeeId(), config.getMonth(), id);
        if (!unique) throw new BusinessException("同一员工、同一月份已存在绩效记录", 400);
        config.setId(id);
        boolean updated = monthlyPerformanceService.updateById(config);
        if (!updated) throw new BusinessException("更新失败", 500);
        return Result.succeed(null);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除月度绩效")
    public Result<Void> delete(@PathVariable Long id) {
        boolean removed = monthlyPerformanceService.removeById(id);
        if (!removed) throw new BusinessException("删除失败", 500);
        return Result.succeed(null);
    }

    @GetMapping("/page")
    @Operation(summary = "分页条件查询月度绩效")
    public PageResult<MonthlyPerformance> page(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) String employeeName,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String month,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false, defaultValue = "false") Boolean includeSubDept) {
        Page<MonthlyPerformance> page = new Page<>(pageNum, pageSize);
        IPage<MonthlyPerformance> result = monthlyPerformanceService.pageQuery(page, employeeId, employeeName, departmentId, month, status, includeSubDept);
        return PageResultUtil.buildPageResult(result);
    }

    @GetMapping("/history/{employeeId}")
    @Operation(summary = "查询员工历史绩效")
    public Result<List<MonthlyPerformance>> history(@PathVariable Long employeeId) {
        List<MonthlyPerformance> list = monthlyPerformanceService.getHistoryByEmployee(employeeId);
        return Result.succeed(list);
    }

    @PostMapping("/check-unique")
    @Operation(summary = "校验唯一性")
    public Result<Boolean> checkUnique(@RequestParam Long employeeId,
                                       @RequestParam String month,
                                       @RequestParam(required = false) Long excludeId) {
        boolean valid = monthlyPerformanceService.checkUnique(employeeId, month, excludeId);
        return Result.succeed(valid);
    }

    @PostMapping("/restore/{id}")
    @Operation(summary = "恢复已删除的月度绩效")
    public Result<?> restore(@PathVariable Long id) {
        boolean ok = monthlyPerformanceService.restore(id);
        return ok ? Result.succeed(null) : Result.failed(null);
    }

    @PostMapping("/batch")
    @Operation(summary = "批量录入月度绩效")
    public Result<Void> batchAdd(@RequestBody List<MonthlyPerformance> list) {
        monthlyPerformanceService.batchSave(list);
        return Result.succeed(null);
    }

    @PostMapping("/import/template")
    @Operation(summary = "下载导入模板")
    public ResponseEntity<ByteArrayResource> downloadTemplate() {
        try {
            byte[] templateBytes = monthlyPerformanceService.generateImportTemplate();
            
            ByteArrayResource resource = new ByteArrayResource(templateBytes);
            
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=monthly_performance_template.xlsx");
            headers.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE);
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(templateBytes.length)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/import")
    @Operation(summary = "导入月度绩效数据")
    public Result<Map<String, Object>> importData(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return Result.failed("文件不能为空");
            }
            
            String fileName = file.getOriginalFilename();
            if (fileName == null || (!fileName.toLowerCase().endsWith(".xlsx") && !fileName.toLowerCase().endsWith(".xls"))) {
                return Result.failed("请上传Excel文件(.xlsx或.xls格式)");
            }
            
            Map<String, Object> result = monthlyPerformanceService.importExcelData(file);
            
            if ((Boolean) result.get("success")) {
                return Result.succeed(result, "导入成功");
            } else {
                return Result.failed(result, (String) result.get("message"));
            }
        } catch (Exception e) {
            return Result.failed("导入失败：" + e.getMessage());
        }
    }

    @GetMapping("/import/status")
    @Operation(summary = "查询导入结果")
    public Result<Map<String, String>> getImportStatus() {
        // 这里可以实现异步导入状态查询，目前简化为同步处理
        Map<String, String> status = new HashMap<>();
        status.put("status", "completed");
        status.put("message", "导入已完成");
        return Result.succeed(status);
    }
} 