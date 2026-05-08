package com.central.mall.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.central.mall.model.entity.MallUserAddress;

import java.util.List;

public interface IUserAddressService extends IService<MallUserAddress> {

    /**
     * 获取用户收货地址列表
     */
    List<MallUserAddress> getByUserId(Long userId);

    /**
     * 设置默认收货地址
     */
    boolean setDefault(Long userId, Long addressId);
}