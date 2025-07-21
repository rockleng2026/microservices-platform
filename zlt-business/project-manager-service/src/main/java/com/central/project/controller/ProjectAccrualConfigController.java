package com.central.project.controller;

import com.central.project.model.ProjectAccrualConfig;
import com.central.project.service.IProjectAccrualConfigService;
import com.central.common.model.Result;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;

@RestController
@RequestMapping("/api/v2/project/{projectId}/accrual-config")
public class ProjectAccrualConfigController {
    @Resource
    private IProjectAccrualConfigService configService;

    @GetMapping
    public Result<List<ProjectAccrualConfig>> getConfig(@PathVariable Long projectId) {
        List<ProjectAccrualConfig> list = configService.getByProjectId(projectId);
        return Result.succeed(list);
    }

    @PostMapping
    public Result<Void> saveConfig(@PathVariable Long projectId, @RequestBody List<ProjectAccrualConfig> configs) {
        configService.saveOrUpdateBatch(configs, projectId);
        return Result.succeed(null);
    }
} 