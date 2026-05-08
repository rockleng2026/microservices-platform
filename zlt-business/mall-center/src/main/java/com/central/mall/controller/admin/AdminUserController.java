package com.central.mall.controller.admin;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.central.common.model.Result;
import com.central.mall.model.dto.UserListDTO;
import com.central.mall.model.vo.UserStatisticsVO;
import com.central.mall.service.IAdminUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mall/admin/user")
@RequiredArgsConstructor
@Tag(name = "管理员-用户管理")
public class AdminUserController {

    private final IAdminUserService adminUserService;

    @GetMapping("/list")
    @Operation(summary = "User list with consumption stats (USER-04)")
    public Result<IPage<UserListDTO>> getUserPage(
            @RequestParam(defaultValue = "1") Long page,
            @RequestParam(defaultValue = "20") Long pageSize,
            @RequestParam(required = false) String keyword) {
        return Result.succeed(adminUserService.getUserPage(page, pageSize, keyword));
    }

    @GetMapping("/{userId}/statistics")
    @Operation(summary = "User statistics (USER-05)")
    public Result<UserStatisticsVO> getUserStatistics(@PathVariable Long userId) {
        return Result.succeed(adminUserService.getUserStatistics(userId));
    }
}