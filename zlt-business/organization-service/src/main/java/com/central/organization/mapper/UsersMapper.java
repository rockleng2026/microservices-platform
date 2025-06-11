package com.central.organization.mapper;

import com.central.common.model.SysUser;
import com.central.organization.model.PortalUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

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
} 