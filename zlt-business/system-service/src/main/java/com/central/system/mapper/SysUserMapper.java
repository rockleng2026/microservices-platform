package com.central.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.system.model.SysUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 系统用户Mapper接口
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {

    /**
     * 分页查询用户列表（含员工信息）
     * 
     * @param page 分页参数
     * @param username 用户名
     * @param employeeName 员工姓名
     * @param departmentId 部门ID
     * @param status 状态
     * @return 用户列表
     */
    Page<SysUser> selectUserPage(Page<SysUser> page, 
                                @Param("username") String username,
                                @Param("employeeName") String employeeName,
                                @Param("departmentId") Long departmentId,
                                @Param("status") Integer status);

    /**
     * 根据用户名查询用户（含员工和权限信息）
     * 
     * @param username 用户名
     * @return 用户信息
     */
    SysUser selectByUsername(@Param("username") String username);

    /**
     * 根据员工ID查询用户
     * 
     * @param employeeId 员工ID
     * @return 用户信息
     */
    SysUser selectByEmployeeId(@Param("employeeId") Long employeeId);

    /**
     * 根据手机号查询用户
     * 
     * @param mobile 手机号
     * @return 用户信息
     */
    SysUser selectByMobile(@Param("mobile") String mobile);

    /**
     * 批量更新用户状态
     * 
     * @param userIds 用户ID列表
     * @param status 状态
     * @return 更新数量
     */
    int batchUpdateStatus(@Param("userIds") List<Long> userIds, @Param("status") Integer status);

    /**
     * 获取部门用户统计
     * 
     * @param departmentId 部门ID
     * @return 用户数量
     */
    int countByDepartment(@Param("departmentId") Long departmentId);
} 