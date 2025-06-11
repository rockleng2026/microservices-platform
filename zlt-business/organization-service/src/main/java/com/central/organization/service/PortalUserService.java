package com.central.organization.service;

import com.central.common.model.SysUser;

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
     * 获取当前用户详细信息（包含员工、部门、岗位信息）
     * 
     * @param userId 用户ID
     * @return 用户详细信息
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
} 