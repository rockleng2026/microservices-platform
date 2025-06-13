package com.central.organization.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.central.common.model.PageResult;
import com.central.organization.model.Workposition;
import com.central.organization.model.dto.WorkpositionQueryDTO;
import com.central.organization.model.dto.WorkpositionSaveDTO;
import com.central.organization.model.vo.WorkpositionVO;

import java.util.List;

/**
 * 岗位管理Service接口
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
public interface IWorkpositionService extends IService<Workposition> {

    /**
     * 分页查询岗位列表
     * 
     * @param queryDTO 查询条件
     * @return 分页结果
     */
    PageResult<WorkpositionVO> queryPage(WorkpositionQueryDTO queryDTO);

    /**
     * 根据ID查询岗位详情
     * 
     * @param id 岗位ID
     * @return 岗位详情
     */
    WorkpositionVO getDetailById(Long id);

    /**
     * 保存岗位（新增或更新）
     * 
     * @param saveDTO 保存数据
     * @return 是否成功
     */
    boolean saveWorkposition(WorkpositionSaveDTO saveDTO);

    /**
     * 根据ID删除岗位
     * 
     * @param id 岗位ID
     * @return 是否成功
     */
    boolean deleteById(Long id);

    /**
     * 批量删除岗位
     * 
     * @param ids 岗位ID列表
     * @return 是否成功
     */
    boolean batchDelete(List<Long> ids);

    /**
     * 更新岗位状态
     * 
     * @param ids 岗位ID列表
     * @param status 状态
     * @return 是否成功
     */
    boolean updateStatus(List<Long> ids, Integer status);

    /**
     * 根据部门ID查询岗位列表
     * 
     * @param departmentId 部门ID
     * @return 岗位列表
     */
    List<WorkpositionVO> getByDepartmentId(Long departmentId);

    /**
     * 根据员工ID查询岗位列表
     * 
     * @param employeeId 员工ID
     * @return 岗位列表
     */
    List<WorkpositionVO> getByEmployeeId(Long employeeId);

    /**
     * 根据用户ID查询岗位列表
     * 
     * @param userId 用户ID
     * @return 岗位列表
     */
    List<WorkpositionVO> getByUserId(Long userId);

    /**
     * 查询管理岗位列表
     * 
     * @return 管理岗位列表
     */
    List<WorkpositionVO> getManagerPositions();

    /**
     * 根据岗位ID查询分管岗位列表
     * 
     * @param positionId 岗位ID
     * @return 分管岗位列表
     */
    List<WorkpositionVO> getSubPositions(Long positionId);

    /**
     * 检查岗位名称是否已存在
     * 
     * @param name 岗位名称
     * @param departmentId 部门ID
     * @param excludeId 排除的岗位ID（编辑时使用）
     * @return 是否存在
     */
    boolean checkNameExists(String name, Long departmentId, Long excludeId);

    /**
     * 获取部门下岗位数量
     * 
     * @param departmentId 部门ID
     * @return 岗位数量
     */
    Integer getPositionCountByDepartment(Long departmentId);

    /**
     * 获取岗位下员工数量
     * 
     * @param positionId 岗位ID
     * @return 员工数量
     */
    Integer getEmployeeCountByPosition(Long positionId);

    /**
     * 复制岗位
     * 
     * @param sourceId 源岗位ID
     * @param targetDepartmentId 目标部门ID
     * @param newName 新岗位名称
     * @return 是否成功
     */
    boolean copyWorkposition(Long sourceId, Long targetDepartmentId, String newName);

    /**
     * 配置岗位权限
     * 
     * @param positionId 岗位ID
     * @param menuIds 菜单权限ID列表
     * @param menuFuncIds 菜单功能权限ID列表
     * @return 是否成功
     */
    boolean configPermissions(Long positionId, String menuIds, String menuFuncIds);

    /**
     * 获取岗位权限配置
     * 
     * @param positionId 岗位ID
     * @return 权限配置
     */
    WorkpositionVO getPermissionConfig(Long positionId);
} 