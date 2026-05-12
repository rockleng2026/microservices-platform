package com.central.mall.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.central.mall.model.entity.MallMember;

public interface IMallMemberService extends IService<MallMember> {

    /**
     * 根据用户ID获取会员资料
     */
    MallMember getByUserId(Long userId);
}
