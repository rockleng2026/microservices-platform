package com.central.mall.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.mall.mapper.MallUserAddressMapper;
import com.central.mall.model.entity.MallUserAddress;
import com.central.mall.service.IUserAddressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserAddressServiceImpl extends ServiceImpl<MallUserAddressMapper, MallUserAddress> implements IUserAddressService {

    @Override
    public List<MallUserAddress> getByUserId(Long userId) {
        LambdaQueryWrapper<MallUserAddress> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallUserAddress::getUserId, userId).orderByDesc(MallUserAddress::getIsDefault);
        return baseMapper.selectList(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean setDefault(Long userId, Long addressId) {
        // 清除该用户的所有默认地址
        LambdaQueryWrapper<MallUserAddress> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallUserAddress::getUserId, userId).eq(MallUserAddress::getIsDefault, 1);
        List<MallUserAddress> defaultAddresses = baseMapper.selectList(wrapper);
        for (MallUserAddress address : defaultAddresses) {
            address.setIsDefault(0);
            baseMapper.updateById(address);
        }

        // 设置新的默认地址
        MallUserAddress address = baseMapper.selectById(addressId);
        if (address != null && address.getUserId().equals(userId)) {
            address.setIsDefault(1);
            return baseMapper.updateById(address) > 0;
        }

        return false;
    }
}