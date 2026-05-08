package com.central.mall.controller.admin;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.central.common.model.Result;
import com.central.mall.config.TenantInterceptor;
import com.central.mall.mapper.MallExpressMapper;
import com.central.mall.model.dto.ExpressDTO;
import com.central.mall.model.entity.MallExpress;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/mall/admin/express")
@RequiredArgsConstructor
@Tag(name = "管理员-物流公司管理")
public class AdminExpressController {

    private final MallExpressMapper expressMapper;

    @GetMapping("/list")
    @Operation(summary = "Get express company list (DELIVERY-01)")
    public Result<List<MallExpress>> getExpressList(@RequestParam(required = false) Integer status) {
        String tenantId = TenantInterceptor.getCurrentTenantId();
        LambdaQueryWrapper<MallExpress> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallExpress::getTenantId, tenantId);
        if (status != null) {
            wrapper.eq(MallExpress::getStatus, status);
        }
        wrapper.orderByAsc(MallExpress::getSort).orderByDesc(MallExpress::getCreateTime);
        List<MallExpress> list = expressMapper.selectList(wrapper);
        return Result.succeed(list);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get express company detail")
    public Result<MallExpress> getExpressDetail(@PathVariable Long id) {
        String tenantId = TenantInterceptor.getCurrentTenantId();
        MallExpress express = expressMapper.selectById(id);
        if (express == null || !tenantId.equals(express.getTenantId())) {
            return Result.failed("物流公司不存在");
        }
        return Result.succeed(express);
    }

    @PostMapping("/")
    @Operation(summary = "Create express company (DELIVERY-01)")
    public Result<Boolean> createExpress(@RequestBody ExpressDTO dto) {
        if (dto.getName() == null || dto.getName().isBlank()) {
            return Result.failed("物流公司名称不能为空");
        }
        if (dto.getCode() == null || dto.getCode().isBlank()) {
            return Result.failed("物流编码不能为空");
        }

        String tenantId = TenantInterceptor.getCurrentTenantId();

        // Check code uniqueness
        LambdaQueryWrapper<MallExpress> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallExpress::getTenantId, tenantId)
                .eq(MallExpress::getCode, dto.getCode());
        if (expressMapper.selectCount(wrapper) > 0) {
            return Result.failed("物流编码已存在");
        }

        MallExpress express = new MallExpress();
        express.setTenantId(tenantId);
        express.setName(dto.getName());
        express.setCode(dto.getCode());
        express.setLogo(dto.getLogo());
        express.setSort(dto.getSort() != null ? dto.getSort() : 0);
        express.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        express.setCreateTime(LocalDateTime.now());
        express.setUpdateTime(LocalDateTime.now());
        expressMapper.insert(express);
        return Result.succeed(true);
    }

    @PutMapping("/")
    @Operation(summary = "Update express company (DELIVERY-01)")
    public Result<Boolean> updateExpress(@RequestBody ExpressDTO dto) {
        if (dto.getId() == null) {
            return Result.failed("ID不能为空");
        }
        if (dto.getName() == null || dto.getName().isBlank()) {
            return Result.failed("物流公司名称不能为空");
        }
        if (dto.getCode() == null || dto.getCode().isBlank()) {
            return Result.failed("物流编码不能为空");
        }

        String tenantId = TenantInterceptor.getCurrentTenantId();
        MallExpress express = expressMapper.selectById(dto.getId());
        if (express == null || !tenantId.equals(express.getTenantId())) {
            return Result.failed("物流公司不存在");
        }

        // Check code uniqueness (excluding current record)
        LambdaQueryWrapper<MallExpress> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallExpress::getTenantId, tenantId)
                .eq(MallExpress::getCode, dto.getCode())
                .ne(MallExpress::getId, dto.getId());
        if (expressMapper.selectCount(wrapper) > 0) {
            return Result.failed("物流编码已存在");
        }

        express.setName(dto.getName());
        express.setCode(dto.getCode());
        express.setLogo(dto.getLogo());
        if (dto.getSort() != null) express.setSort(dto.getSort());
        if (dto.getStatus() != null) express.setStatus(dto.getStatus());
        express.setUpdateTime(LocalDateTime.now());
        expressMapper.updateById(express);
        return Result.succeed(true);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete express company (soft delete)")
    public Result<Boolean> deleteExpress(@PathVariable Long id) {
        String tenantId = TenantInterceptor.getCurrentTenantId();
        MallExpress express = expressMapper.selectById(id);
        if (express == null || !tenantId.equals(express.getTenantId())) {
            return Result.failed("物流公司不存在");
        }
        express.setStatus(0); // Soft delete
        express.setUpdateTime(LocalDateTime.now());
        expressMapper.updateById(express);
        return Result.succeed(true);
    }

    @PutMapping("/{id}/status/{status}")
    @Operation(summary = "Enable/disable express company")
    public Result<Boolean> updateStatus(@PathVariable Long id, @PathVariable Integer status) {
        String tenantId = TenantInterceptor.getCurrentTenantId();
        MallExpress express = expressMapper.selectById(id);
        if (express == null || !tenantId.equals(express.getTenantId())) {
            return Result.failed("物流公司不存在");
        }
        express.setStatus(status);
        express.setUpdateTime(LocalDateTime.now());
        expressMapper.updateById(express);
        return Result.succeed(true);
    }
}