package com.central.organization.mapper;

import com.central.common.model.SysUser;
import com.central.organization.model.PortalUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 用户数据访问接口
 * 
 * @author zlt
 */
@Mapper
public interface UsersMapper {

    /**
     * 根据主键查询用户
     */
    PortalUser selectByPrimaryKey(@Param("id") Long id);

    /**
     * 根据用户名查询用户
     */
    PortalUser selectByUsername(@Param("username") String username);

    /**
     * 根据手机号查询用户
     */
    PortalUser selectByMobile(@Param("mobile") String mobile);

    /**
     * 插入用户
     */
    int insert(SysUser user);

    /**
     * 根据主键选择性更新用户
     */
    int updateByPrimaryKeySelective(SysUser user);

    /**
     * 根据主键删除用户
     */
    int deleteByPrimaryKey(@Param("id") Long id);

    /**
     * 分页查询账号
     */
    List<PortalUser> selectPage(@Param("keyword") String keyword, @Param("status") Integer status, @Param("offset") int offset, @Param("size") Integer size);

    /**
     * 统计账号总数
     */
    long countPage(@Param("keyword") String keyword, @Param("status") Integer status);

    /**
     * 根据员工ID查找账号
     */
    PortalUser selectByEmployeeId(@Param("employeeId") Long employeeId);
} 