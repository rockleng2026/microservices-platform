package com.central.project.controller;

import com.central.project.model.ProjectAccrualDetail;
import com.central.project.service.IProjectAccrualDetailService;
import com.central.common.model.Result;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;

@RestController
@RequestMapping("/api/v2/project/{projectId}/accrual-detail")
public class ProjectAccrualDetailController {
    @Resource
    private IProjectAccrualDetailService detailService;

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
} 