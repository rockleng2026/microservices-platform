package com.central.mall.controller;

import com.central.common.model.Result;
import com.central.mall.common.UserContext;
import com.central.mall.model.entity.MallMember;
import com.central.mall.service.IMallMemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/mall/user")
@RequiredArgsConstructor
@Tag(name = "用户管理", description = "小程序端用户接口")
public class UserController {

    private final IMallMemberService memberService;

    @GetMapping("/info")
    @Operation(summary = "获取个人信息")
    public Result<Map<String, Object>> getUserInfo() {
        Long memberId = getCurrentUserId();
        MallMember member = memberService.getById(memberId);
        if (member == null) {
            return Result.failed("用户不存在");
        }
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("memberId", member.getId());
        userInfo.put("nickname", member.getNickname() != null ? member.getNickname() : "");
        userInfo.put("avatar", member.getAvatar() != null ? member.getAvatar() : "");
        userInfo.put("phone", member.getPhone() != null ? member.getPhone() : "");
        userInfo.put("gender", member.getGender() != null ? member.getGender() : 0);
        userInfo.put("birthday", member.getBirthday() != null ? member.getBirthday().toString() : "");
        userInfo.put("province", member.getProvince() != null ? member.getProvince() : "");
        userInfo.put("city", member.getCity() != null ? member.getCity() : "");
        userInfo.put("wxOpenId", member.getWxOpenId() != null ? member.getWxOpenId() : "");
        userInfo.put("wxNickname", member.getWxNickname() != null ? member.getWxNickname() : "");
        return Result.succeed(userInfo);
    }

    @GetMapping("/address/list")
    @Operation(summary = "获取收货地址列表")
    public Result<Object> getAddressList() {
        // TODO: implement via IUserAddressService.getByUserId(getCurrentUserId())
        return Result.succeed(null);
    }

    private Long getCurrentUserId() {
        return UserContext.getCurrentUserId();
    }
}