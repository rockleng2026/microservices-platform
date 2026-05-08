package com.central.mall.controller;

import com.central.common.model.Result;
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

    @GetMapping("/info")
    @Operation(summary = "会员信息 (MARKETING-07)")
    public Result<?> getMemberInfo() {
        Long userId = getCurrentUserId();
        return marketingService.getMemberInfo(userId);
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
        // TODO: integrate with real auth context
        return 1L;
    }
}
