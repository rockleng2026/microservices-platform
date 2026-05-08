package com.central.mall.controller.admin;

import com.central.common.model.Result;
import com.central.mall.mapper.MallPointsAccountMapper;
import com.central.mall.mapper.MallPointsLogMapper;
import com.central.mall.model.entity.MallPointsAccount;
import com.central.mall.model.entity.MallPointsLog;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

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

    @GetMapping("/list")
    @Operation(summary = "会员列表")
    public Result<?> getMemberList(
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long pageSize) {
        var accounts = pointsAccountMapper.selectList(null);
        return Result.succeed(accounts);
    }

    @GetMapping("/{id}")
    @Operation(summary = "会员详情")
    public Result<?> getMemberDetail(@PathVariable Long id) {
        MallPointsAccount account = pointsAccountMapper.selectById(id);
        if (account == null) {
            return Result.failed("会员不存在");
        }
        return Result.succeed(account);
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
}
