package com.central.project.controller;

import com.central.project.model.ProjectAccrualDetail;
import com.central.project.service.IProjectAccrualDetailService;
import com.central.common.model.Result;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;
import com.central.project.model.Project;
import com.central.project.model.ProjectAccrualConfig;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/v2/project/{projectId}/accrual-detail")
public class ProjectAccrualDetailController {
    @Resource
    private IProjectAccrualDetailService detailService;
    @Resource
    private com.central.project.service.IProjectService projectService;
    @Resource
    private com.central.project.service.IProjectAccrualConfigService projectAccrualConfigService;

    @GetMapping
    public Result<List<ProjectAccrualDetail>> getDetail(@PathVariable Long projectId) {
        List<ProjectAccrualDetail> list = detailService.getByProjectId(projectId);
        return Result.succeed(list);
    }

    @PostMapping
    public Result<Void> saveDetail(@PathVariable Long projectId, @RequestBody List<ProjectAccrualDetail> details) {
        detailService.saveOrUpdateBatch(details, projectId);
        return Result.succeed(null);
    }

    @GetMapping("/v2")
    public Result<Map<String, Object>> getDetailV2(@PathVariable Long projectId) {
        Map<String, Object> result = new HashMap<>();
        // 1. 基本信息
        Project project = projectService.getProjectDetailById(projectId);
        result.put("project", project);
        // 2. 项目参与人
        result.put("participants", project.getParticipantDetails());
        // 3. 项目结项信息
        result.put("closure", project.getClosure());
        // 4. 项目提成分配规则
        java.util.List<ProjectAccrualConfig> configs = projectAccrualConfigService.getByProjectId(projectId);
        result.put("accrualConfigs", configs);
        // 5. 项目提成分配明细
        java.util.List<ProjectAccrualDetail> details = detailService.getByProjectId(projectId);
        result.put("accrualDetails", details);
        return Result.succeed(result);
    }
} 