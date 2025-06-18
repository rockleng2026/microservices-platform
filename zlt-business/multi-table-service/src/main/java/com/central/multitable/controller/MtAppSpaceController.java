package com.central.multitable.controller;

import com.central.common.model.Result;
import com.central.multitable.model.MtAppSpace;
import com.central.multitable.service.IMtAppSpaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 应用空间Controller
 *
 * @author zlt
 * @date 2025-06-17
 */
@Slf4j
@RestController
@RequestMapping("/api/app-spaces")
@Tag(name = "应用空间管理", description = "应用空间相关接口")
public class MtAppSpaceController {

    @Autowired
    private IMtAppSpaceService appSpaceService;

    @Operation(summary = "获取应用空间列表", description = "获取当前租户下的所有应用空间")
    @GetMapping
    public Result<List<MtAppSpace>> list() {
        try {
            // 使用框架的自动租户过滤，不需要手动传递租户ID
            List<MtAppSpace> appSpaces = appSpaceService.list();
            return Result.succeed(appSpaces);
        } catch (Exception e) {
            log.error("获取应用空间列表失败", e);
            return Result.failed(e.getMessage());
        }
    }

    @Operation(summary = "根据团队ID获取应用空间列表", description = "获取指定团队下的应用空间")
    @GetMapping("/team/{teamId}")
    public Result<List<MtAppSpace>> listByTeamId(
            @Parameter(description = "团队ID") @PathVariable Long teamId) {
        try {
            List<MtAppSpace> appSpaces = appSpaceService.listByTeamId(teamId);
            return Result.succeed(appSpaces);
        } catch (Exception e) {
            log.error("根据团队ID获取应用空间列表失败", e);
            return Result.failed(e.getMessage());
        }
    }

    @Operation(summary = "根据编码获取应用空间", description = "根据应用空间编码获取详细信息")
    @GetMapping("/{uniCode}")
    public Result<MtAppSpace> getByUniCode(
            @Parameter(description = "应用空间编码") @PathVariable String uniCode) {
        try {
            MtAppSpace appSpace = appSpaceService.getByUniCode(uniCode);
            if (appSpace == null) {
                return Result.failed("应用空间不存在");
            }
            return Result.succeed(appSpace);
        } catch (Exception e) {
            log.error("根据编码获取应用空间失败", e);
            return Result.failed(e.getMessage());
        }
    }

    @Operation(summary = "创建应用空间", description = "创建新的应用空间")
    @PostMapping
    public Result<String> create(@RequestBody MtAppSpace appSpace) {
        try {
            boolean success = appSpaceService.createAppSpace(appSpace);
            if (success) {
                return Result.succeed("创建成功");
            } else {
                return Result.failed("创建失败");
            }
        } catch (Exception e) {
            log.error("创建应用空间失败", e);
            return Result.failed(e.getMessage());
        }
    }

    @Operation(summary = "更新应用空间", description = "更新应用空间信息")
    @PutMapping("/{id}")
    public Result<String> update(
            @Parameter(description = "应用空间ID") @PathVariable Long id,
            @RequestBody MtAppSpace appSpace) {
        try {
            appSpace.setId(id);
            boolean success = appSpaceService.updateAppSpace(appSpace);
            if (success) {
                return Result.succeed("更新成功");
            } else {
                return Result.failed("更新失败");
            }
        } catch (Exception e) {
            log.error("更新应用空间失败", e);
            return Result.failed(e.getMessage());
        }
    }

    @Operation(summary = "删除应用空间", description = "删除指定的应用空间")
    @DeleteMapping("/{id}")
    public Result<String> delete(@Parameter(description = "应用空间ID") @PathVariable Long id) {
        try {
            boolean success = appSpaceService.deleteAppSpace(id);
            if (success) {
                return Result.succeed("删除成功");
            } else {
                return Result.failed("删除失败");
            }
        } catch (Exception e) {
            log.error("删除应用空间失败", e);
            return Result.failed(e.getMessage());
        }
    }

    @Operation(summary = "创建应用空间（包含默认表格）", description = "创建新的应用空间并自动创建默认表格和字段")
    @PostMapping("/create-with-defaults")
    public Result<MtAppSpace> createWithDefaults(
            @Parameter(description = "租户ID") @RequestParam String tenantId,
            @Parameter(description = "团队ID") @RequestParam Long teamId,
            @Parameter(description = "创建人ID") @RequestParam Long createdBy) {
        try {
            MtAppSpace result = appSpaceService.createAppSpaceWithDefaultTable(tenantId, teamId, createdBy);
            return Result.succeed(result, "创建成功");
        } catch (Exception e) {
            log.error("创建应用空间失败", e);
            return Result.failed(e.getMessage());
        }
    }
} 