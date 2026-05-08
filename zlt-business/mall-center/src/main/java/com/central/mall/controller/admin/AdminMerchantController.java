package com.central.mall.controller.admin;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.central.common.model.Result;
import com.central.mall.model.dto.MerchantDTO;
import com.central.mall.service.IMerchantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 管理员-商户管理控制器
 *
 * @author Portal Team
 * @since 2026-05-08
 */
@RestController
@RequestMapping("/api/mall/admin/merchant")
@RequiredArgsConstructor
@Tag(name = "管理员-商户管理")
@Validated
public class AdminMerchantController {

    private final IMerchantService merchantService;

    @GetMapping("/list")
    @Operation(summary = "商户列表（分页）")
    public Result<IPage<MerchantDTO>> getMerchantPage(
            @RequestParam(defaultValue = "1") Long page,
            @RequestParam(defaultValue = "20") Long pageSize,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String keyword) {
        IPage<MerchantDTO> result = merchantService.getMerchantPage(
                new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(page, pageSize),
                Map.of("status", status != null ? String.valueOf(status) : "", "keyword", keyword != null ? keyword : "")
        );
        return Result.succeed(result);
    }

    @GetMapping("/{id}")
    @Operation(summary = "商户详情")
    public Result<MerchantDTO> getMerchantDetail(@PathVariable Long id) {
        MerchantDTO merchant = merchantService.getMerchantDetail(id);
        if (merchant == null) {
            return Result.failed("商户不存在");
        }
        return Result.succeed(merchant);
    }

    @PostMapping("/review/{id}")
    @Operation(summary = "审核商户")
    public Result<Boolean> reviewMerchant(@PathVariable Long id, @RequestBody @Validated MerchantReviewDTO dto) {
        boolean result = merchantService.reviewMerchant(id, dto.getStatus(), dto.getRejectReason());
        return result ? Result.succeed(true, "审核成功") : Result.failed("审核失败");
    }

    @Data
    public static class MerchantReviewDTO {
        @NotNull
        private Integer status;
        private String rejectReason;
    }
}