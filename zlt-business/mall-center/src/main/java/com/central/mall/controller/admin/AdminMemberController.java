package com.central.mall.controller.admin;

import com.central.common.model.Result;
import com.central.mall.mapper.MallPointsAccountMapper;
import com.central.mall.mapper.MallPointsLogMapper;
import com.central.mall.model.entity.MallPointsAccount;
import com.central.mall.model.entity.MallPointsLog;
import com.central.mall.model.entity.MallUserAddress;
import com.central.mall.model.entity.MallMember;
import com.central.mall.service.IMallMemberService;
import com.central.mall.service.IUserAddressService;
import com.central.mall.config.TenantInterceptor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 管理员会员积分控制器
 */
@RestController
@RequestMapping("/api/mall/admin/member")
@RequiredArgsConstructor
@Tag(name = "管理员-会员积分管理")
public class AdminMemberController {

    private final MallPointsAccountMapper pointsAccountMapper;
    private final MallPointsLogMapper pointsLogMapper;
    private final IUserAddressService userAddressService;
    private final IMallMemberService mallMemberService;

    @GetMapping("/list")
    @Operation(summary = "会员列表")
    public Result<?> getMemberList(
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long pageSize) {
        var accounts = pointsAccountMapper.selectList(null);
        java.util.List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();
        for (MallPointsAccount account : accounts) {
            MallMember member = mallMemberService.getByUserId(account.getUserId());
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", account.getId());
            map.put("userId", account.getUserId());
            map.put("balance", account.getBalance());
            map.put("totalEarned", account.getTotalEarned());
            map.put("totalSpent", account.getTotalSpent());
            map.put("createTime", account.getCreateTime());
            map.put("updateTime", account.getUpdateTime());
            if (member != null) {
                map.put("nickname", member.getNickname());
                map.put("avatar", member.getAvatar());
                map.put("phone", member.getPhone());
                map.put("gender", member.getGender());
                map.put("birthday", member.getBirthday());
                map.put("province", member.getProvince());
                map.put("city", member.getCity());
                map.put("wxNickname", member.getWxNickname());
                map.put("wxOpenId", member.getWxOpenId());
            }
            result.add(map);
        }
        return Result.succeed(result);
    }

    @GetMapping("/{id}")
    @Operation(summary = "会员详情")
    public Result<?> getMemberDetail(@PathVariable Long id) {
        MallPointsAccount account = pointsAccountMapper.selectById(id);
        if (account == null) {
            return Result.failed("会员不存在");
        }
        MallMember member = mallMemberService.getByUserId(account.getUserId());
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("points", account);
        result.put("member", member);
        return Result.succeed(result);
    }

    @PutMapping("/{id}/points")
    @Operation(summary = "调整会员积分 (MARKETING-09)")
    public Result<?> adjustPoints(@PathVariable Long id,
            @RequestBody(required = false) Integer points,
            @RequestParam(required = false) String remark) {
        MallPointsAccount account = pointsAccountMapper.selectById(id);
        if (account == null) {
            return Result.failed("会员不存在");
        }
        if (points == null || points == 0) {
            return Result.failed("积分调整量不能为0");
        }

        int newBalance = account.getBalance() + points;
        if (newBalance < 0) {
            return Result.failed("积分余额不足");
        }

        account.setBalance(newBalance);
        if (points > 0) {
            account.setTotalEarned(account.getTotalEarned() + points);
        } else {
            account.setTotalSpent(account.getTotalSpent() + Math.abs(points));
        }
        account.setUpdateTime(LocalDateTime.now());
        pointsAccountMapper.updateById(account);

        // 记录日志
        MallPointsLog log = new MallPointsLog();
        log.setUserId(account.getUserId());
        log.setType(points > 0 ? 1 : 2); // 1=获得,2=消耗
        log.setPoints(Math.abs(points));
        log.setBalanceAfter(newBalance);
        log.setSource("ADMIN");
        log.setSourceId(id.toString());
        log.setRemark(remark != null ? remark : "管理员调整");
        log.setCreateTime(LocalDateTime.now());
        log.setUpdateTime(LocalDateTime.now());
        pointsLogMapper.insert(log);

        return Result.succeed(true, "积分调整成功");
    }

    @GetMapping("/{userId}/addresses")
    @Operation(summary = "获取会员地址列表")
    public Result<List<MallUserAddress>> getMemberAddresses(@PathVariable Long userId) {
        List<MallUserAddress> addresses = userAddressService.getByUserId(userId);
        return Result.succeed(addresses);
    }

    @PostMapping("/{userId}/address")
    @Operation(summary = "新增会员地址")
    public Result<Void> addMemberAddress(@PathVariable Long userId, @RequestBody MallUserAddress address) {
        address.setUserId(userId);
        String tenantId = TenantInterceptor.getCurrentTenantId();
        if (tenantId == null) tenantId = "default";
        address.setTenantId(tenantId);
        userAddressService.save(address);
        return Result.succeed();
    }

    @PutMapping("/address/{id}")
    @Operation(summary = "修改会员地址")
    public Result<Void> updateMemberAddress(@PathVariable Long id, @RequestBody MallUserAddress address) {
        MallUserAddress existing = userAddressService.getById(id);
        if (existing == null) {
            return Result.failed("地址不存在");
        }
        address.setId(id);
        userAddressService.updateById(address);
        return Result.succeed();
    }

    @DeleteMapping("/address/{id}")
    @Operation(summary = "删除会员地址")
    public Result<Void> deleteMemberAddress(@PathVariable Long id) {
        userAddressService.removeById(id);
        return Result.succeed();
    }
}
