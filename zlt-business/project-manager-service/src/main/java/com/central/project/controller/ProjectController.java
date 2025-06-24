package com.central.project.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.central.common.model.Result;
import com.central.project.model.Project;
import com.central.project.model.ProjectClosure;
import com.central.project.model.ProjectProfitDistribution;
import com.central.project.model.dto.ProjectQueryDTO;
import com.central.project.model.dto.ProjectSaveDTO;
import com.central.project.service.IProjectService;
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
import java.util.Map;

/**
 * 项目管理Controller
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Slf4j
@RestController
@RequestMapping("/api/project/projects")
@Tag(name = "项目管理", description = "项目管理相关接口")
@Validated
public class ProjectController {
    
    @Autowired
    private IProjectService projectService;
    
    /**
     * 分页查询项目列表
     * @param queryDTO 查询条件
     * @return 项目分页列表
     */
    @GetMapping("/page")
    @Operation(summary = "分页查询项目列表", description = "支持多条件查询和排序")
    public Result<IPage<Project>> getProjectPage(@Valid ProjectQueryDTO queryDTO) {
        try {
            IPage<Project> page = projectService.getProjectPage(queryDTO);
            return Result.succeed(page);
        } catch (Exception e) {
            log.error("分页查询项目列表失败", e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 根据ID查询项目详情
     * @param id 项目ID
     * @return 项目详情
     */
    @GetMapping("/{id}")
    @Operation(summary = "查询项目详情", description = "根据ID查询项目详细信息")
    public Result<Project> getProjectById(
            @Parameter(description = "项目ID") @PathVariable("id") String id) {
        try {
            Long projectId = IdUtils.stringToLong(id);
            if (projectId == null) {
                return Result.failed("项目ID格式错误");
            }
            
            Project project = projectService.getProjectDetailById(projectId);
            if (project == null) {
                return Result.failed("项目不存在");
            }
            
            return Result.succeed(project);
        } catch (Exception e) {
            log.error("查询项目详情失败，ID: {}", id, e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 新增项目
     * @param saveDTO 项目数据
     * @return 操作结果
     */
    @PostMapping
    @Operation(summary = "新增项目", description = "创建新的项目")
    public Result<Project> createProject(@Valid @RequestBody ProjectSaveDTO saveDTO) {
        try {
            // 检查项目名称是否重复
            if (projectService.existsByName(saveDTO.getName(), null)) {
                return Result.failed("项目名称已存在");
            }
            
            Project project = projectService.saveProject(saveDTO);
            return Result.succeed(project, "项目创建成功");
        } catch (Exception e) {
            log.error("新增项目失败", e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 修改项目
     * @param id 项目ID
     * @param saveDTO 项目数据
     * @return 操作结果
     */
    @PutMapping("/{id}")
    @Operation(summary = "修改项目", description = "根据ID修改项目信息")
    public Result<Project> updateProject(
            @Parameter(description = "项目ID") @PathVariable("id") String id,
            @Valid @RequestBody ProjectSaveDTO saveDTO) {
        try {
            Long projectId = IdUtils.stringToLong(id);
            if (projectId == null) {
                return Result.failed("项目ID格式错误");
            }
            
            // 检查项目是否存在
            Project existProject = projectService.getById(projectId);
            if (existProject == null) {
                return Result.failed("项目不存在");
            }
            
            // 检查项目名称是否重复（排除当前项目）
            if (projectService.existsByName(saveDTO.getName(), projectId)) {
                return Result.failed("项目名称已存在");
            }
            
            saveDTO.setId(projectId);
            Project project = projectService.saveProject(saveDTO);
            return Result.succeed(project, "项目修改成功");
        } catch (Exception e) {
            log.error("修改项目失败，ID: {}", id, e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 删除项目
     * @param id 项目ID
     * @return 操作结果
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除项目", description = "根据ID删除项目（软删除）")
    public Result<Boolean> deleteProject(
            @Parameter(description = "项目ID") @PathVariable("id") String id) {
        try {
            Long projectId = IdUtils.stringToLong(id);
            if (projectId == null) {
                return Result.failed("项目ID格式错误");
            }
            
            Boolean result = projectService.deleteProject(projectId);
            return result ? Result.succeed(true, "项目删除成功") : Result.failed("项目删除失败");
        } catch (Exception e) {
            log.error("删除项目失败，ID: {}", id, e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 批量删除项目
     * @param ids 项目ID列表
     * @return 操作结果
     */
    @DeleteMapping("/batch")
    @Operation(summary = "批量删除项目", description = "批量删除多个项目")
    public Result<Boolean> batchDeleteProjects(@RequestBody List<String> ids) {
        try {
            if (ids == null || ids.isEmpty()) {
                return Result.failed("请选择要删除的项目");
            }
            
            List<Long> projectIds = ids.stream()
                    .map(IdUtils::stringToLong)
                    .filter(id -> id != null)
                    .toList();
            
            if (projectIds.isEmpty()) {
                return Result.failed("项目ID格式错误");
            }
            
            Boolean result = projectService.batchDeleteProjects(projectIds);
            return result ? Result.succeed(true, "批量删除成功") : Result.failed("批量删除失败");
        } catch (Exception e) {
            log.error("批量删除项目失败", e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 更新项目状态
     * @param id 项目ID
     * @param status 新状态
     * @return 操作结果
     */
    @PutMapping("/{id}/status")
    @Operation(summary = "更新项目状态", description = "更改项目的状态")
    public Result<Boolean> updateProjectStatus(
            @Parameter(description = "项目ID") @PathVariable("id") String id,
            @Parameter(description = "新状态") @RequestParam String status) {
        try {
            Long projectId = IdUtils.stringToLong(id);
            if (projectId == null) {
                return Result.failed("项目ID格式错误");
            }
            
            Boolean result = projectService.updateProjectStatus(projectId, status);
            return result ? Result.succeed(true, "状态更新成功") : Result.failed("状态更新失败");
        } catch (Exception e) {
            log.error("更新项目状态失败，ID: {}, status: {}", id, status, e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 批量更新项目状态
     * @param request 请求参数
     * @return 操作结果
     */
    @PutMapping("/batch/status")
    @Operation(summary = "批量更新项目状态", description = "批量更新多个项目的状态")
    public Result<Boolean> batchUpdateProjectStatus(@RequestBody Map<String, Object> request) {
        try {
            List<String> ids = (List<String>) request.get("ids");
            String status = (String) request.get("status");
            
            if (ids == null || ids.isEmpty()) {
                return Result.failed("请选择要更新的项目");
            }
            
            List<Long> projectIds = ids.stream()
                    .map(IdUtils::stringToLong)
                    .filter(id -> id != null)
                    .toList();
            
            Boolean result = projectService.batchUpdateProjectStatus(projectIds, status);
            return result ? Result.succeed(true, "批量状态更新成功") : Result.failed("批量状态更新失败");
        } catch (Exception e) {
            log.error("批量更新项目状态失败", e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 根据负责人查询项目列表
     * @param leaderId 负责人ID
     * @return 项目列表
     */
    @GetMapping("/leader/{leaderId}")
    @Operation(summary = "查询负责人的项目", description = "根据负责人ID查询项目列表")
    public Result<List<Project>> getProjectsByLeader(
            @Parameter(description = "负责人ID") @PathVariable("leaderId") String leaderId) {
        try {
            Long leaderIdLong = IdUtils.stringToLong(leaderId);
            if (leaderIdLong == null) {
                return Result.failed("负责人ID格式错误");
            }
            
            List<Project> projects = projectService.getProjectsByLeaderId(leaderIdLong);
            return Result.succeed(projects);
        } catch (Exception e) {
            log.error("查询负责人项目失败，leaderId: {}", leaderId, e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 根据参与人查询项目列表
     * @param participantId 参与人ID
     * @return 项目列表
     */
    @GetMapping("/participant/{participantId}")
    @Operation(summary = "查询参与人的项目", description = "根据参与人ID查询项目列表")
    public Result<List<Project>> getProjectsByParticipant(
            @Parameter(description = "参与人ID") @PathVariable("participantId") String participantId) {
        try {
            Long participantIdLong = IdUtils.stringToLong(participantId);
            if (participantIdLong == null) {
                return Result.failed("参与人ID格式错误");
            }
            
            List<Project> projects = projectService.getProjectsByParticipantId(participantIdLong);
            return Result.succeed(projects);
        } catch (Exception e) {
            log.error("查询参与人项目失败，participantId: {}", participantId, e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 项目立项审批
     * @param id 项目ID
     * @param request 审批请求
     * @return 操作结果
     */
    @PostMapping("/{id}/approve")
    @Operation(summary = "项目立项审批", description = "对项目立项进行审批")
    public Result<Boolean> approveProjectEstablishment(
            @Parameter(description = "项目ID") @PathVariable("id") String id,
            @RequestBody Map<String, Object> request) {
        try {
            Long projectId = IdUtils.stringToLong(id);
            if (projectId == null) {
                return Result.failed("项目ID格式错误");
            }
            
            Boolean approved = (Boolean) request.get("approved");
            String reason = (String) request.get("reason");
            
            Boolean result = projectService.approveProjectEstablishment(projectId, approved, reason);
            return result ? Result.succeed(true, "审批成功") : Result.failed("审批失败");
        } catch (Exception e) {
            log.error("项目立项审批失败，ID: {}", id, e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 项目结项申请
     * @param id 项目ID
     * @param closureData 结项数据
     * @return 操作结果
     */
    @PostMapping("/{id}/closure")
    @Operation(summary = "项目结项申请", description = "申请项目结项")
    public Result<Boolean> applyProjectClosure(
            @Parameter(description = "项目ID") @PathVariable("id") String id,
            @RequestBody Map<String, Object> closureData) {
        try {
            Long projectId = IdUtils.stringToLong(id);
            if (projectId == null) {
                return Result.failed("项目ID格式错误");
            }
            
            Boolean result = projectService.applyProjectClosure(projectId, closureData);
            return result ? Result.succeed(true, "结项申请提交成功") : Result.failed("结项申请提交失败");
        } catch (Exception e) {
            log.error("项目结项申请失败，ID: {}", id, e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 添加项目参与人
     * @param id 项目ID
     * @param request 参与人信息
     * @return 操作结果
     */
    @PostMapping("/{id}/participants")
    @Operation(summary = "添加项目参与人", description = "为项目添加参与人")
    public Result<Boolean> addProjectParticipant(
            @Parameter(description = "项目ID") @PathVariable("id") String id,
            @RequestBody Map<String, Object> request) {
        try {
            Long projectId = IdUtils.stringToLong(id);
            if (projectId == null) {
                return Result.failed("项目ID格式错误");
            }
            
            String participantIdStr = (String) request.get("participantId");
            String role = (String) request.get("role");
            
            Long participantId = IdUtils.stringToLong(participantIdStr);
            if (participantId == null) {
                return Result.failed("参与人ID格式错误");
            }
            
            Boolean result = projectService.addProjectParticipant(projectId, participantId, role);
            return result ? Result.succeed(true, "添加参与人成功") : Result.failed("添加参与人失败");
        } catch (Exception e) {
            log.error("添加项目参与人失败，ID: {}", id, e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 移除项目参与人
     * @param id 项目ID
     * @param participantId 参与人ID
     * @return 操作结果
     */
    @DeleteMapping("/{id}/participants/{participantId}")
    @Operation(summary = "移除项目参与人", description = "从项目中移除参与人")
    public Result<Boolean> removeProjectParticipant(
            @Parameter(description = "项目ID") @PathVariable("id") String id,
            @Parameter(description = "参与人ID") @PathVariable("participantId") String participantId) {
        try {
            Long projectId = IdUtils.stringToLong(id);
            Long participantIdLong = IdUtils.stringToLong(participantId);
            
            if (projectId == null || participantIdLong == null) {
                return Result.failed("ID格式错误");
            }
            
            Boolean result = projectService.removeProjectParticipant(projectId, participantIdLong);
            return result ? Result.succeed(true, "移除参与人成功") : Result.failed("移除参与人失败");
        } catch (Exception e) {
            log.error("移除项目参与人失败，projectId: {}, participantId: {}", id, participantId, e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 查询项目统计信息
     * @return 统计信息
     */
    @GetMapping("/statistics")
    @Operation(summary = "查询项目统计信息", description = "获取项目的统计数据")
    public Result<Map<String, Object>> getProjectStatistics() {
        try {
            Map<String, Object> statistics = projectService.getProjectStatistics();
            return Result.succeed(statistics);
        } catch (Exception e) {
            log.error("查询项目统计信息失败", e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 查询即将到期的项目
     * @param days 天数
     * @return 项目列表
     */
    @GetMapping("/expiring")
    @Operation(summary = "查询即将到期的项目", description = "查询即将到期或已到期的项目")
    public Result<List<Project>> getExpiringProjects(
            @Parameter(description = "天数") @RequestParam(defaultValue = "7") Integer days) {
        try {
            List<Project> projects = projectService.getExpiringProjects(days);
            return Result.succeed(projects);
        } catch (Exception e) {
            log.error("查询即将到期项目失败", e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 根据状态查询项目列表
     * @param status 项目状态
     * @return 项目列表
     */
    @GetMapping("/status/{status}")
    @Operation(summary = "按状态查询项目", description = "根据状态查询项目列表")
    public Result<List<Project>> getProjectsByStatus(
            @Parameter(description = "项目状态") @PathVariable String status) {
        try {
            List<Project> projects = projectService.getProjectsByStatus(status);
            return Result.succeed(projects);
        } catch (Exception e) {
            log.error("按状态查询项目失败，status: {}", status, e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 根据类别查询项目列表
     * @param category 项目类别
     * @return 项目列表
     */
    @GetMapping("/category/{category}")
    @Operation(summary = "按类别查询项目", description = "根据类别查询项目列表")
    public Result<List<Project>> getProjectsByCategory(
            @Parameter(description = "项目类别") @PathVariable String category) {
        try {
            List<Project> projects = projectService.getProjectsByCategory(category);
            return Result.succeed(projects);
        } catch (Exception e) {
            log.error("按类别查询项目失败，category: {}", category, e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 项目结项完成
     * @param id 项目ID
     * @param closureData 结项详细数据
     * @return 操作结果
     */
    @PostMapping("/{id}/closure/complete")
    @Operation(summary = "项目结项完成", description = "完成项目结项，录入财务数据")
    public Result<Boolean> completeProjectClosure(
            @Parameter(description = "项目ID") @PathVariable("id") String id,
            @RequestBody ProjectClosure closureData) {
        try {
            Long projectId = IdUtils.stringToLong(id);
            if (projectId == null) {
                return Result.failed("项目ID格式错误");
            }
            
            closureData.setProjectId(projectId);
            Boolean result = projectService.completeProjectClosure(closureData);
            return result ? Result.succeed(true, "项目结项完成") : Result.failed("项目结项失败");
        } catch (Exception e) {
            log.error("项目结项完成失败，ID: {}", id, e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 查询项目结项信息
     * @param id 项目ID
     * @return 结项信息
     */
    @GetMapping("/{id}/closure")
    @Operation(summary = "查询项目结项信息", description = "获取项目的结项详细信息")
    public Result<ProjectClosure> getProjectClosure(
            @Parameter(description = "项目ID") @PathVariable("id") String id) {
        try {
            Long projectId = IdUtils.stringToLong(id);
            if (projectId == null) {
                return Result.failed("项目ID格式错误");
            }
            
            ProjectClosure closure = projectService.getProjectClosure(projectId);
            return Result.succeed(closure);
        } catch (Exception e) {
            log.error("查询项目结项信息失败，ID: {}", id, e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 创建项目提成分配方案
     * @param id 项目ID
     * @param distributions 分配方案列表
     * @return 操作结果
     */
    @PostMapping("/{id}/profit-distribution")
    @Operation(summary = "创建项目提成分配方案", description = "为项目创建毛利分配方案")
    public Result<Boolean> createProfitDistribution(
            @Parameter(description = "项目ID") @PathVariable("id") String id,
            @RequestBody List<ProjectProfitDistribution> distributions) {
        try {
            Long projectId = IdUtils.stringToLong(id);
            if (projectId == null) {
                return Result.failed("项目ID格式错误");
            }
            
            // 设置项目ID
            distributions.forEach(distribution -> distribution.setProjectId(projectId));
            
            Boolean result = projectService.createProfitDistribution(projectId, distributions);
            return result ? Result.succeed(true, "提成分配方案创建成功") : Result.failed("提成分配方案创建失败");
        } catch (Exception e) {
            log.error("创建项目提成分配失败，ID: {}", id, e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 查询项目提成分配列表
     * @param id 项目ID
     * @return 分配列表
     */
    @GetMapping("/{id}/profit-distribution")
    @Operation(summary = "查询项目提成分配列表", description = "获取项目的毛利分配信息")
    public Result<List<ProjectProfitDistribution>> getProfitDistribution(
            @Parameter(description = "项目ID") @PathVariable("id") String id) {
        try {
            Long projectId = IdUtils.stringToLong(id);
            if (projectId == null) {
                return Result.failed("项目ID格式错误");
            }
            
            List<ProjectProfitDistribution> distributions = projectService.getProfitDistribution(projectId);
            return Result.succeed(distributions);
        } catch (Exception e) {
            log.error("查询项目提成分配失败，ID: {}", id, e);
            return Result.failed(e.getMessage());
        }
    }
    
    /**
     * 审批项目提成分配
     * @param id 项目ID
     * @param request 审批请求
     * @return 操作结果
     */
    @PostMapping("/{id}/profit-distribution/approve")
    @Operation(summary = "审批项目提成分配", description = "对项目提成分配方案进行审批")
    public Result<Boolean> approveProfitDistribution(
            @Parameter(description = "项目ID") @PathVariable("id") String id,
            @RequestBody Map<String, Object> request) {
        try {
            Long projectId = IdUtils.stringToLong(id);
            if (projectId == null) {
                return Result.failed("项目ID格式错误");
            }
            
            Boolean approved = (Boolean) request.get("approved");
            String reason = (String) request.get("reason");
            
            Boolean result = projectService.approveProfitDistribution(projectId, approved, reason);
            return result ? Result.succeed(true, "提成分配审批成功") : Result.failed("提成分配审批失败");
        } catch (Exception e) {
            log.error("项目提成分配审批失败，ID: {}", id, e);
            return Result.failed(e.getMessage());
        }
    }
} 