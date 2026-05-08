package com.central.mall.controller;

import com.central.common.model.Result;
import com.central.mall.model.dto.EvaluateDTO;
import com.central.mall.model.dto.EvaluateListDTO;
import com.central.mall.service.IEvaluateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mall/evaluate")
@RequiredArgsConstructor
@Tag(name = "商品评价", description = "小程序端评价接口")
@Validated
public class EvaluateController {

    private final IEvaluateService evaluateService;

    @PostMapping
    @Operation(summary = "提交评价 (EVAL-01)")
    public Result<Boolean> submitEvaluate(@RequestBody @Validated EvaluateDTO dto) {
        if (dto.getStar() == null || dto.getStar() < 1 || dto.getStar() > 5) {
            return Result.failed("评分必须在1-5之间");
        }
        if (dto.getContent() != null && dto.getContent().length() > 500) {
            return Result.failed("评价内容不能超过500字符");
        }
        if (dto.getImages() != null && dto.getImages().size() > 9) {
            return Result.failed("评价图片最多9张");
        }
        Long userId = getCurrentUserId();
        try {
            boolean success = evaluateService.submitEvaluate(userId, dto);
            return success ? Result.succeed(true) : Result.failed("评价失败");
        } catch (RuntimeException e) {
            return Result.failed(e.getMessage());
        }
    }

    @GetMapping
    @Operation(summary = "我的评价列表 (EVAL-02)")
    public Result<?> getUserEvaluates(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Long userId = getCurrentUserId();
        return Result.succeed(evaluateService.listUserEvaluates(userId, page, pageSize));
    }

    @GetMapping("/goods/{goodsId}")
    @Operation(summary = "商品评价列表 (EVAL-03)")
    public Result<?> getGoodsEvaluates(
            @PathVariable Long goodsId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return Result.succeed(evaluateService.listGoodsEvaluates(goodsId, page, pageSize));
    }

    private Long getCurrentUserId() {
        // TODO: integrate with real auth context
        return 1L;
    }
}