package com.central.mall.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.central.common.model.Result;
import com.central.mall.model.entity.MallMember;

import java.util.Map;

public interface IMallMemberService extends IService<MallMember> {

    /**
     * 根据用户ID获取会员资料
     */
    MallMember getByUserId(Long userId);

    /**
     * 根据微信OpenId获取会员
     */
    MallMember getByWxOpenId(String openId);

    /**
     * 根据用户名获取会员
     */
    MallMember getByUsername(String username);

    /**
     * 根据手机号获取会员
     */
    MallMember getByPhone(String phone);

    /**
     * 更新会员资料
     */
    Result<?> updateMember(Long userId, Map<String, Object> params);
}
