package com.central.mall.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.central.common.model.Result;
import com.central.mall.model.entity.MallGoods;
import com.central.mall.service.IGoodsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mall/goods")
@RequiredArgsConstructor
@Tag(name = "商品管理", description = "小程序端商品接口")
public class GoodsController {

    private final IGoodsService goodsService;

    @GetMapping("/categories")
    @Operation(summary = "获取分类树")
    public Result<List<Map<String, Object>>> getCategories() {
        return Result.success(goodsService.getCategoryTree());
    }

    @GetMapping("/list")
    @Operation(summary = "商品列表")
    public Result<IPage<MallGoods>> getGoodsList(
            @RequestParam(defaultValue = "1") Long page,
            @RequestParam(defaultValue = "20") Long pageSize,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "createTime") String sortField,
            @RequestParam(defaultValue = "desc") String sortOrder) {
        IPage<MallGoods> pageResult = goodsService.getGoodsPage(
            new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(page, pageSize),
            Map.of("categoryId", categoryId != null ? categoryId : "",
                   "keyword", keyword != null ? keyword : "",
                   "sortField", sortField,
                   "sortOrder", sortOrder)
        );
        return Result.success(pageResult);
    }

    @GetMapping("/{id}")
    @Operation(summary = "商品详情")
    public Result<Map<String, Object>> getGoodsDetail(@PathVariable Long id) {
        return Result.success(goodsService.getGoodsDetail(id));
    }

    @GetMapping("/hot")
    @Operation(summary = "热门推荐")
    public Result<List<MallGoods>> getHotGoods(@RequestParam(defaultValue = "10") int limit) {
        return Result.success(goodsService.getHotGoods(limit));
    }
}