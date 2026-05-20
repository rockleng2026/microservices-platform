package com.central.mall.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.common.model.Result;
import com.central.mall.mapper.MallMemberMapper;
import com.central.mall.model.entity.MallMember;
import com.central.mall.service.IMallMemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class MallMemberServiceImpl extends ServiceImpl<MallMemberMapper, MallMember> implements IMallMemberService {

    @Override
    public MallMember getByUserId(Long memberId) {
        // 方法名遗留但实际按 memberId (mall_member.id) 查询
        return baseMapper.selectById(memberId);
    }

    @Override
    public MallMember getByWxOpenId(String openId) {
        LambdaQueryWrapper<MallMember> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallMember::getWxOpenId, openId);
        return baseMapper.selectOne(wrapper);
    }

    @Override
    public MallMember getByUsername(String username) {
        // 用户名匹配手机号或昵称
        LambdaQueryWrapper<MallMember> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallMember::getPhone, username).or().eq(MallMember::getNickname, username);
        return baseMapper.selectOne(wrapper);
    }

    @Override
    public MallMember getByPhone(String phone) {
        LambdaQueryWrapper<MallMember> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallMember::getPhone, phone);
        return baseMapper.selectOne(wrapper);
    }

    @Override
    public Result<?> updateMember(Long userId, Map<String, Object> params) {
        MallMember member = getByUserId(userId);
        if (member == null) {
            // Find by any identifier
            Object phone = params.get("phone");
            if (phone != null) {
                member = getByPhone(phone.toString());
            }
        }

        if (member == null) {
            // Create new member if not exists
            member = new MallMember();
            member.setTenantId("default");
            // 不再设置冗余的 userId 字段，mall_member.id (AUTO_INCREMENT) 将作为主键
            this.save(member);
        }

        // Update fields
        if (params.containsKey("nickname")) {
            member.setNickname(params.get("nickname").toString());
        }
        if (params.containsKey("avatar")) {
            member.setAvatar(params.get("avatar").toString());
        }
        if (params.containsKey("gender")) {
            member.setGender(Integer.parseInt(params.get("gender").toString()));
        }
        if (params.containsKey("birthday")) {
            member.setBirthday(LocalDate.parse(params.get("birthday").toString()));
        }
        if (params.containsKey("province")) {
            member.setProvince(params.get("province").toString());
        }
        if (params.containsKey("city")) {
            member.setCity(params.get("city").toString());
        }
        if (params.containsKey("phone")) {
            member.setPhone(params.get("phone").toString());
        }

        baseMapper.updateById(member);
        return Result.succeed(member);
    }
}
