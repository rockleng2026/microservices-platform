package com.central.organization.service;

import com.central.common.model.SysUser;
import com.central.organization.model.UserPersonalConfig;

import java.util.List;
import java.util.Map;

/**
 * Portal用户服务接口
 * 
 * @author zlt
 */
public interface PortalUserService {

    /**
     * 根据用户名查询用户信息（包含角色权限）
     * 
     * @param username 用户名
     * @return 用户信息
     */
    SysUser findByUsername(String username);

    /**
     * 根据手机号查询用户信息
     * 
     * @param mobile 手机号
     * @return 用户信息
     */
    SysUser findByMobile(String mobile);

    /**
     * 根据用户ID查询用户信息
     * 
     * @param userId 用户ID
     * @return 用户信息
     */
    SysUser findByUserId(Long userId);

    /**
     * 获取当前用户详细信息（包含员工、部门、岗位、权限、个性化配置等）
     * 
     * @param userId 用户ID
     * @return 用户详细信息，包含：
     *         - 用户基本信息
     *         - 员工信息
     *         - 部门信息
     *         - 岗位列表（用户关联的所有岗位）
     *         - 当前岗位信息
     *         - 当前岗位的菜单权限
     *         - 个性化配置
     */
    Map<String, Object> getCurrentUserInfo(Long userId);

    /**
     * 切换用户岗位
     * 
     * @param userId 用户ID
     * @param positionId 新岗位ID
     * @return 切换结果（包含新的权限信息）
     */
    Map<String, Object> switchUserPosition(Long userId, Long positionId);

    /**
     * 获取用户的所有岗位信息
     * 
     * @param userId 用户ID
     * @return 岗位列表
     */
    List<Map<String, Object>> getUserPositions(Long userId);

    /**
     * 获取用户当前岗位的菜单权限
     * 
     * @param userId 用户ID
     * @return 菜单权限树
     */
    List<Map<String, Object>> getCurrentUserMenus(Long userId);

    /**
     * 获取用户个性化配置
     * 
     * @param userId 用户ID
     * @return 个性化配置
     */
    UserPersonalConfig getUserPersonalConfig(Long userId);

    /**
     * 保存用户个性化配置
     * 
     * @param config 个性化配置
     * @return 是否成功
     */
    boolean saveUserPersonalConfig(UserPersonalConfig config);

    /**
     * 更新用户默认岗位
     * 
     * @param userId 用户ID
     * @param positionId 默认岗位ID
     * @return 是否成功
     */
    boolean updateDefaultPosition(Long userId, Long positionId);

    /**
     * 初始化用户默认配置
     * 当用户首次登录时调用，设置默认的个性化配置
     * 
     * @param userId 用户ID
     * @param defaultPositionId 默认岗位ID（可为空）
     * @return 是否成功
     */
    boolean initUserDefaultConfig(Long userId, Long defaultPositionId);
} 