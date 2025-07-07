package com.central.soo.controller;

import com.central.common.model.Result;
import com.central.common.model.PageResult;
import com.central.common.exception.BusinessException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.core.io.ByteArrayResource;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/soo/payslip")
@Tag(name = "工资条管理")
public class PayslipController {

    @GetMapping("/templates")
    @Operation(summary = "获取工资条模板列表")
    public Result<List<Map<String, Object>>> getPayslipTemplates() {
        List<Map<String, Object>> templates = new ArrayList<>();
        
        Map<String, Object> template1 = new HashMap<>();
        template1.put("id", 1L);
        template1.put("templateName", "标准工资条模板");
        template1.put("templateType", "standard");
        template1.put("isDefault", true);
        template1.put("previewUrl", "/templates/preview/1");
        template1.put("createdAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        templates.add(template1);
        
        Map<String, Object> template2 = new HashMap<>();
        template2.put("id", 2L);
        template2.put("templateName", "详细工资条模板");
        template2.put("templateType", "detailed");
        template2.put("isDefault", false);
        template2.put("previewUrl", "/templates/preview/2");
        template2.put("createdAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        templates.add(template2);
        
        return Result.succeed(templates);
    }

    @PostMapping("/batch-task")
    @Operation(summary = "创建批量生成工资条任务")
    public Result<Map<String, Object>> createPayslipBatchTask(@RequestBody Map<String, Object> data) {
        Map<String, Object> task = new HashMap<>();
        task.put("id", System.currentTimeMillis());
        task.put("taskName", "批量生成工资条-" + data.get("month"));
        task.put("month", data.get("month"));
        task.put("totalCount", 100);
        task.put("successCount", 0);
        task.put("failedCount", 0);
        task.put("taskStatus", "created");
        task.put("templateId", data.get("templateId"));
        task.put("sendMethod", data.get("sendMethod"));
        task.put("startTime", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        
        return Result.succeed(task);
    }

    @PostMapping("/task/{taskId}/execute")
    @Operation(summary = "执行工资条生成任务")
    public Result<Void> executePayslipGenerationTask(@PathVariable Long taskId) {
        System.out.println("执行工资条生成任务: " + taskId);
        return Result.succeed(null);
    }

    @GetMapping("/task/{taskId}/status")
    @Operation(summary = "查询工资条生成任务状态")
    public Result<Map<String, Object>> getPayslipTaskStatus(@PathVariable Long taskId) {
        Map<String, Object> status = new HashMap<>();
        status.put("id", taskId);
        status.put("taskName", "批量生成工资条-2024-12");
        status.put("month", "2024-12");
        status.put("totalCount", 100);
        status.put("successCount", 85);
        status.put("failedCount", 5);
        status.put("taskStatus", "running");
        status.put("templateId", 1L);
        status.put("sendMethod", "email");
        
        return Result.succeed(status);
    }

    @GetMapping("/list")
    @Operation(summary = "获取工资条列表")
    public PageResult<Map<String, Object>> getPayslips(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String month,
            @RequestParam(required = false) String status) {
        
        List<Map<String, Object>> payslips = new ArrayList<>();
        String[] employees = {"张三", "李四", "王五", "赵六", "钱七"};
        
        for (int i = 0; i < employees.length; i++) {
            Map<String, Object> payslip = new HashMap<>();
            payslip.put("id", (long) (i + 1));
            payslip.put("month", "2024-12");
            payslip.put("employeeId", (long) (i + 1));
            payslip.put("employeeName", employees[i]);
            payslip.put("employeeNo", "EMP" + String.format("%03d", i + 1));
            payslip.put("departmentName", "技术部");
            payslip.put("templateId", 1L);
            payslip.put("templateName", "标准工资条模板");
            payslip.put("generationStatus", i % 2 == 0 ? "generated" : "failed");
            payslip.put("sendStatus", i % 3 == 0 ? "sent" : "pending");
            payslip.put("sendMethod", "email");
            payslip.put("recipientEmail", employees[i].toLowerCase() + "@company.com");
            payslip.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            payslip.put("sentAt", i % 3 == 0 ? LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null);
            payslip.put("downloadCount", i + 1);
            payslip.put("fileUrl", "/payslip/download/" + (i + 1));
            
            payslips.add(payslip);
        }

        PageResult<Map<String, Object>> result = new PageResult<>();
        result.setData(payslips);
        result.setCount((long) payslips.size());
        result.setPage(page);
        result.setSize(size);
        result.setPages(1);
        result.setResp_code(0);
        return result;
    }

    @GetMapping("/batch-tasks")
    @Operation(summary = "获取批量任务列表")
    public Result<List<Map<String, Object>>> getPayslipBatchTasks() {
        List<Map<String, Object>> tasks = new ArrayList<>();
        
        for (int i = 1; i <= 3; i++) {
            Map<String, Object> task = new HashMap<>();
            task.put("id", (long) i);
            task.put("taskName", "批量生成工资条-2024-" + String.format("%02d", 13 - i));
            task.put("month", "2024-" + String.format("%02d", 13 - i));
            task.put("totalCount", 100);
            task.put("successCount", i == 1 ? 85 : 100);
            task.put("failedCount", i == 1 ? 5 : 0);
            task.put("taskStatus", i == 1 ? "running" : "completed");
            task.put("templateId", 1L);
            task.put("sendMethod", "email");
            task.put("startTime", LocalDateTime.now().minusDays(i).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            task.put("endTime", i == 1 ? null : LocalDateTime.now().minusDays(i).plusHours(1).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            
            tasks.add(task);
        }
        
        return Result.succeed(tasks);
    }

    @GetMapping("/download/{payslipId}")
    @Operation(summary = "下载工资条")
    public ResponseEntity<ByteArrayResource> downloadPayslip(@PathVariable Long payslipId) {
        try {
            // 模拟生成PDF工资条
            String content = "工资条内容 - 员工ID: " + payslipId + ", 月份: 2024-12";
            byte[] pdfBytes = content.getBytes();
            
            ByteArrayResource resource = new ByteArrayResource(pdfBytes);
            
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=payslip_" + payslipId + ".pdf");
            headers.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE);
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(pdfBytes.length)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/send/{payslipId}")
    @Operation(summary = "发送工资条")
    public Result<Void> sendPayslip(@PathVariable Long payslipId, @RequestBody Map<String, Object> data) {
        System.out.println("发送工资条 ID: " + payslipId + ", 发送方式: " + data.get("sendMethod"));
        return Result.succeed(null);
    }

    @PostMapping("/batch-send")
    @Operation(summary = "批量发送工资条")
    public Result<Void> batchSendPayslips(@RequestBody Map<String, Object> data) {
        System.out.println("批量发送工资条: " + data);
        return Result.succeed(null);
    }

    @PostMapping("/generate-single")
    @Operation(summary = "生成单个工资条")
    public Result<Map<String, Object>> generateSinglePayslip(@RequestBody Map<String, Object> data) {
        Map<String, Object> payslip = new HashMap<>();
        payslip.put("id", System.currentTimeMillis());
        payslip.put("employeeId", data.get("employeeId"));
        payslip.put("month", data.get("month"));
        payslip.put("templateId", data.get("templateId"));
        payslip.put("generationStatus", "generated");
        payslip.put("fileUrl", "/payslip/download/" + System.currentTimeMillis());
        
        return Result.succeed(payslip);
    }
} 