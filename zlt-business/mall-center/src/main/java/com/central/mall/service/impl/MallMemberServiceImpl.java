package com.central.mall.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.mall.mapper.MallMemberMapper;
import com.central.mall.model.entity.MallMember;
import com.central.mall.service.IMallMemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MallMemberServiceImpl extends ServiceImpl<MallMemberMapper, MallMember> implements IMallMemberService {

    @Override
    public MallMember getByUserId(Long userId) {
        LambdaQueryWrapper<MallMember> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallMember::getUserId, userId);
        return baseMapper.selectOne(wrapper);
    }
}
