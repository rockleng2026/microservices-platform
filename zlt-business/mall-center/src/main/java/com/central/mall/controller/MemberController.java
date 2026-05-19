package com.central.mall.controller;

import com.central.common.model.Result;
import com.central.mall.common.UserContext;
import com.central.mall.model.entity.MallUserFavorite;
import com.central.mall.service.IFavoriteService;
import com.central.mall.service.IMallMemberService;
import com.central.mall.service.IMarketingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
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
    private final IFavoriteService favoriteService;

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

    @GetMapping("/coupons")
    @Operation(summary = "我的优惠券 (MINI-09-04)")
    public Result<?> getUserCoupons(@RequestParam(required = false) Integer status) {
        Long userId = getCurrentUserId();
        Map<String, Object> pageDTO = Map.of("page", 1, "pageSize", 100);
        return marketingService.getUserCouponList(userId, status, pageDTO);
    }

    @GetMapping("/favorites")
    @Operation(summary = "我的收藏 (MINI-09-05)")
    public Result<?> getFavorites(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Long userId = getCurrentUserId();
        List<MallUserFavorite> favorites = favoriteService.getUserFavorites(userId, page, pageSize);

        // Transform to frontend format
        List<Map<String, Object>> list = new java.util.ArrayList<>();
        for (MallUserFavorite fav : favorites) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", fav.getId());
            item.put("goodsId", fav.getGoodsId());
            item.put("goodsName", fav.getGoodsName());
            item.put("price", fav.getPrice());
            item.put("image", fav.getImage());
            item.put("createTime", fav.getCreateTime());
            list.add(item);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("total", list.size());
        return Result.succeed(result);
    }

    @DeleteMapping("/favorites/{id}")
    @Operation(summary = "删除收藏 (MINI-09-06)")
    public Result<?> removeFavorite(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        favoriteService.removeFavorite(userId, id);
        return Result.succeed(true);
    }

    private Long getCurrentUserId() {
        return UserContext.getCurrentUserId();
    }
}
