package com.central.project.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.central.project.model.Project;
import com.central.project.model.ProjectClosure;
import com.central.project.model.ProjectProfitDistribution;
import com.central.project.model.dto.ProjectQueryDTO;
import com.central.project.model.dto.ProjectSaveDTO;
import com.central.project.model.dto.ProjectProfitDistributionSaveDTO;

import java.util.List;
import java.util.Map;

/**
 * 项目服务接口
 * 
 * @author Central Team
 * @since 2024-12-19
 */
public interface IProjectService extends IService<Project> {
    
    /**
     * 分页查询项目列表
     * @param queryDTO 查询条件
     * @return 项目分页列表
     */
    IPage<Project> getProjectPage(ProjectQueryDTO queryDTO);
    
    /**
     * 根据ID获取项目详情
     * @param id 项目ID
     * @return 项目详情
     */
    Project getProjectDetailById(Long id);
    
    /**
     * 保存项目（新增或修改）
     * @param saveDTO 项目保存数据
     * @return 保存后的项目信息
     */
    Project saveProject(ProjectSaveDTO saveDTO);
    
    /**
     * 删除项目（软删除）
     * @param id 项目ID
     * @return 是否成功
     */
    Boolean deleteProject(Long id);
    
    /**
     * 批量删除项目
     * @param ids 项目ID列表
     * @return 是否成功
     */
    Boolean batchDeleteProjects(List<Long> ids);
    
    /**
     * 更新项目状态
     * @param id 项目ID
     * @param status 新状态
     * @return 是否成功
     */
    Boolean updateProjectStatus(Long id, String status);
    
    /**
     * 批量更新项目状态
     * @param ids 项目ID列表
     * @param status 新状态
     * @return 是否成功
     */
    Boolean batchUpdateProjectStatus(List<Long> ids, String status);
    
    /**
     * 根据负责人ID查询项目列表
     * @param leaderId 负责人ID
     * @return 项目列表
     */
    List<Project> getProjectsByLeaderId(Long leaderId);
    
    /**
     * 根据参与人ID查询项目列表
     * @param participantId 参与人ID
     * @return 项目列表
     */
    List<Project> getProjectsByParticipantId(Long participantId);
    
    /**
     * 根据状态查询项目列表
     * @param status 项目状态
     * @return 项目列表
     */
    List<Project> getProjectsByStatus(String status);
    
    /**
     * 根据类别查询项目列表
     * @param category 项目类别
     * @return 项目列表
     */
    List<Project> getProjectsByCategory(String category);
    
    /**
     * 项目立项审批
     * @param id 项目ID
     * @param approved 是否通过
     * @param reason 审批意见
     * @return 是否成功
     */
    Boolean approveProjectEstablishment(Long id, Boolean approved, String reason);
    
    /**
     * 项目结项申请
     * @param id 项目ID
     * @param closureData 结项数据
     * @return 是否成功
     */
    Boolean applyProjectClosure(Long id, Map<String, Object> closureData);
    
    /**
     * 项目结项审批
     * @param id 项目ID
     * @param approved 是否通过
     * @param reason 审批意见
     * @return 是否成功
     */
    Boolean approveProjectClosure(Long id, Boolean approved, String reason);
    
    /**
     * 查询项目统计信息
     * @return 统计信息
     */
    Map<String, Object> getProjectStatistics();
    
    /**
     * 根据时间范围查询项目列表
     * @param startDate 开始时间
     * @param endDate 结束时间
     * @return 项目列表
     */
    List<Project> getProjectsByDateRange(String startDate, String endDate);
    
    /**
     * 查询即将到期的项目
     * @param days 天数
     * @return 项目列表
     */
    List<Project> getExpiringProjects(Integer days);
    
    /**
     * 检查项目名称是否存在
     * @param name 项目名称
     * @param excludeId 排除的项目ID
     * @return 是否存在
     */
    Boolean existsByName(String name, Long excludeId);
    
    /**
     * 添加项目参与人
     * @param projectId 项目ID
     * @param participantId 参与人ID
     * @param role 角色
     * @return 是否成功
     */
    Boolean addProjectParticipant(Long projectId, Long participantId, String role);
    
    /**
     * 移除项目参与人
     * @param projectId 项目ID
     * @param participantId 参与人ID
     * @return 是否成功
     */
    Boolean removeProjectParticipant(Long projectId, Long participantId);
    
    /**
     * 更新项目参与人角色
     * @param projectId 项目ID
     * @param participantId 参与人ID
     * @param role 新角色
     * @return 是否成功
     */
    Boolean updateParticipantRole(Long projectId, Long participantId, String role);
    
    /**
     * 完成项目结项
     * @param closureData 结项数据
     * @return 是否成功
     */
    Boolean completeProjectClosure(ProjectClosure closureData);
    
    /**
     * 查询项目结项信息
     * @param projectId 项目ID
     * @return 结项信息
     */
    ProjectClosure getProjectClosure(Long projectId);
    
    /**
     * 创建项目提成分配方案
     * @param projectId 项目ID
     * @param distributions 分配方案列表
     * @return 是否成功
     */
    Boolean createProfitDistribution(Long projectId, List<ProjectProfitDistribution> distributions);
    
    /**
     * 查询项目提成分配列表
     * @param projectId 项目ID
     * @return 分配列表
     */
    List<ProjectProfitDistribution> getProfitDistribution(Long projectId);
    
    /**
     * 审批项目提成分配
     * @param projectId 项目ID
     * @param approved 是否通过
     * @param reason 审批意见
     * @return 是否成功
     */
    Boolean approveProfitDistribution(Long projectId, Boolean approved, String reason);
    
    /**
     * 保存项目提成分配方案（部门-员工层级）
     * @param saveDTO 提成分配数据
     * @return 是否成功
     */
    Boolean saveProfitDistribution(ProjectProfitDistributionSaveDTO saveDTO);
} 