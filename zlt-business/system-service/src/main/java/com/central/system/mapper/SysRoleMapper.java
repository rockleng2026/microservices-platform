package com.central.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.system.model.SysRole;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 系统角色Mapper接口
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Mapper
public interface SysRoleMapper extends BaseMapper<SysRole> {

    /**
     * 根据用户ID获取用户角色列表
     * 
     * @param userId 用户ID
     * @return 角色列表
     */
    List<SysRole> selectByUserId(@Param("userId") Long userId);

    /**
     * 根据角色编码查询角色
     * 
     * @param roleCode 角色编码
     * @return 角色信息
     */
    SysRole selectByRoleCode(@Param("roleCode") String roleCode);

    /**
     * 批量更新角色状态
     * 
     * @param roleIds 角色ID列表
     * @param status 状态
     * @return 更新数量
     */
    int batchUpdateStatus(@Param("roleIds") List<Long> roleIds, @Param("status") Integer status);

    /**
     * 获取角色用户数量
     * 
     * @param roleId 角色ID
     * @return 用户数量
     */
    int countUsersByRole(@Param("roleId") Long roleId);
} 