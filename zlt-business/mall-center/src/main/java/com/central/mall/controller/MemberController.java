package com.central.mall.controller;

import com.central.common.model.Result;
import com.central.mall.common.UserContext;
import com.central.mall.service.IMallMemberService;
import com.central.mall.service.IMarketingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 会员控制器
 */
@RestController
@RequestMapping("/api/mall/member")
@RequiredArgsConstructor
@Tag(name = "会员管理", description = "小程序端会员接口")
public class MemberController {

    private final IMarketingService marketingService;
    private final IMallMemberService memberService;

    @GetMapping("/info")
    @Operation(summary = "会员信息 (MARKETING-07)")
    public Result<?> getMemberInfo(@RequestHeader(value = "x-tenant-header", required = false) String tenantId) {
        // TODO: Get real userId from auth context
        Long userId = getCurrentUserId();
        return marketingService.getMemberInfo(userId);
    }

    @PostMapping("/update")
    @Operation(summary = "更新会员资料")
    public Result<?> updateMember(@RequestBody Map<String, Object> params) {
        // TODO: Get real userId from auth context
        Long userId = getCurrentUserId();
        return memberService.updateMember(userId, params);
    }

    @GetMapping("/points/log")
    @Operation(summary = "积分记录 (MARKETING-08)")
    public Result<?> getPointsLog(
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long pageSize) {
        Long userId = getCurrentUserId();
        Map<String, Object> pageDTO = Map.of(
            "page", page != null ? page : 1,
            "pageSize", pageSize != null ? pageSize : 20
        );
        return marketingService.getPointsLog(userId, pageDTO);
    }

    private Long getCurrentUserId() {
        return UserContext.getCurrentUserId();
    }
}
