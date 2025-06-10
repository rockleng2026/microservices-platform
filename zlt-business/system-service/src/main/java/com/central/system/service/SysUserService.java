package com.central.system.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.central.system.model.SysUser;

import java.util.List;

/**
 * 系统用户Service接口
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
public interface SysUserService extends IService<SysUser> {

    /**
     * 分页查询用户列表
     * 
     * @param page 分页参数
     * @param username 用户名
     * @param employeeName 员工姓名
     * @param departmentId 部门ID
     * @param status 状态
     * @return 用户分页列表
     */
    Page<SysUser> getUserPage(Page<SysUser> page, String username, String employeeName, Long departmentId, Integer status);

    /**
     * 根据用户名查询用户
     * 
     * @param username 用户名
     * @return 用户信息
     */
    SysUser getUserByUsername(String username);

    /**
     * 根据员工ID查询用户
     * 
     * @param employeeId 员工ID
     * @return 用户信息
     */
    SysUser getUserByEmployeeId(Long employeeId);

    /**
     * 根据手机号查询用户
     * 
     * @param mobile 手机号
     * @return 用户信息
     */
    SysUser getUserByMobile(String mobile);

    /**
     * 保存用户
     * 
     * @param user 用户信息
     * @return 是否成功
     */
    boolean saveUser(SysUser user);

    /**
     * 更新用户
     * 
     * @param user 用户信息
     * @return 是否成功
     */
    boolean updateUser(SysUser user);

    /**
     * 批量更新用户状态
     * 
     * @param userIds 用户ID列表
     * @param status 状态
     * @return 是否成功
     */
    boolean batchUpdateStatus(List<Long> userIds, Integer status);

    /**
     * 重置用户密码
     * 
     * @param userId 用户ID
     * @param newPassword 新密码，为空则设置默认密码
     * @return 是否成功
     */
    boolean resetPassword(Long userId, String newPassword);

    /**
     * 验证用户密码
     * 
     * @param username 用户名
     * @param password 密码
     * @return 是否验证通过
     */
    boolean validatePassword(String username, String password);

    /**
     * 更新用户密码
     * 
     * @param userId 用户ID
     * @param oldPassword 旧密码
     * @param newPassword 新密码
     * @return 是否成功
     */
    boolean updatePassword(Long userId, String oldPassword, String newPassword);

    /**
     * 获取部门用户数量
     * 
     * @param departmentId 部门ID
     * @return 用户数量
     */
    int countByDepartment(Long departmentId);
} 