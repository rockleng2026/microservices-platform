package com.central.organization.controller;

import com.central.common.model.PageResult;
import com.central.common.model.Result;
import com.central.organization.dto.DepartmentDTO;
import com.central.organization.model.Department;
import com.central.organization.service.IDepartmentService;
import com.central.organization.vo.DepartmentTreeVO;
import com.central.organization.vo.DepartmentVO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.util.List;

/**
 * 部门管理控制器
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Slf4j
@RestController
@RequestMapping("/api/organization/department")
@Api(tags = "部门管理")
public class DepartmentController {

    @Autowired
    private IDepartmentService departmentService;

    /**
     * 获取部门树形结构
     */
    @ApiOperation("获取部门树形结构")
    @GetMapping("/tree")
    public Result<List<DepartmentTreeVO>> getDepartmentTree(
            @ApiParam("父部门ID") @RequestParam(required = false) Integer parentId,
            @ApiParam("是否包含禁用部门") @RequestParam(required = false, defaultValue = "false") Boolean includeDisabled,
            @ApiParam("搜索关键词") @RequestParam(required = false) String keyword) {
        
        List<DepartmentTreeVO> tree = departmentService.getDepartmentTree(parentId, includeDisabled, keyword);
        return Result.succeed(tree);
    }

    /**
     * 获取部门列表（分页）
     */
    @ApiOperation("获取部门列表")
    @GetMapping("/list")
    public Result<PageResult<DepartmentVO>> getDepartmentList(
            @ApiParam("页码") @RequestParam(defaultValue = "1") Integer page,
            @ApiParam("页大小") @RequestParam(defaultValue = "20") Integer size,
            @ApiParam("父部门ID") @RequestParam(required = false) Integer parentId,
            @ApiParam("部门名称") @RequestParam(required = false) String name,
            @ApiParam("部门状态") @RequestParam(required = false) Integer status) {
        
        PageResult<DepartmentVO> result = departmentService.getDepartmentList(page, size, parentId, name, status);
        return Result.succeed(result);
    }

    /**
     * 获取部门详情
     */
    @ApiOperation("获取部门详情")
    @GetMapping("/{id}")
    public Result<DepartmentVO> getDepartmentDetail(@ApiParam("部门ID") @PathVariable Integer id) {
        DepartmentVO department = departmentService.getDepartmentDetail(id);
        return Result.succeed(department);
    }

    /**
     * 创建部门
     */
    @ApiOperation("创建部门")
    @PostMapping
    public Result<DepartmentVO> createDepartment(@Valid @RequestBody DepartmentDTO dto) {
        DepartmentVO department = departmentService.createDepartment(dto);
        return Result.succeed(department);
    }

    /**
     * 更新部门
     */
    @ApiOperation("更新部门")
    @PutMapping("/{id}")
    public Result<DepartmentVO> updateDepartment(
            @ApiParam("部门ID") @PathVariable Integer id,
            @Valid @RequestBody DepartmentDTO dto) {
        
        DepartmentVO department = departmentService.updateDepartment(id, dto);
        return Result.succeed(department);
    }

    /**
     * 删除部门
     */
    @ApiOperation("删除部门")
    @DeleteMapping("/{id}")
    public Result<Void> deleteDepartment(@ApiParam("部门ID") @PathVariable Integer id) {
        departmentService.deleteDepartment(id);
        return Result.succeed();
    }

    /**
     * 批量删除部门
     */
    @ApiOperation("批量删除部门")
    @DeleteMapping("/batch")
    public Result<Void> batchDeleteDepartments(@RequestBody List<Integer> ids) {
        departmentService.batchDeleteDepartments(ids);
        return Result.succeed();
    }

    /**
     * 启用/禁用部门
     */
    @ApiOperation("启用/禁用部门")
    @PutMapping("/{id}/status")
    public Result<Void> updateDepartmentStatus(
            @ApiParam("部门ID") @PathVariable Integer id,
            @ApiParam("状态") @RequestParam Integer status) {
        
        departmentService.updateDepartmentStatus(id, status);
        return Result.succeed();
    }

    /**
     * 部门排序
     */
    @ApiOperation("部门排序")
    @PutMapping("/sort")
    public Result<Void> sortDepartments(@RequestBody List<DepartmentDTO> departments) {
        departmentService.sortDepartments(departments);
        return Result.succeed();
    }

    /**
     * 移动部门
     */
    @ApiOperation("移动部门到其他父部门下")
    @PutMapping("/{id}/move")
    public Result<Void> moveDepartment(
            @ApiParam("部门ID") @PathVariable Integer id,
            @ApiParam("新父部门ID") @RequestParam Integer newParentId) {
        
        departmentService.moveDepartment(id, newParentId);
        return Result.succeed();
    }

    /**
     * 获取部门统计信息
     */
    @ApiOperation("获取部门统计信息")
    @GetMapping("/{id}/statistics")
    public Result<Object> getDepartmentStatistics(@ApiParam("部门ID") @PathVariable Integer id) {
        Object statistics = departmentService.getDepartmentStatistics(id);
        return Result.succeed(statistics);
    }

    /**
     * 导入部门数据
     */
    @ApiOperation("导入部门数据")
    @PostMapping("/import")
    public Result<Object> importDepartments(@RequestParam("file") MultipartFile file) {
        Object result = departmentService.importDepartments(file);
        return Result.succeed(result);
    }

    /**
     * 导出部门数据
     */
    @ApiOperation("导出部门数据")
    @GetMapping("/export")
    public Result<String> exportDepartments(
            @ApiParam("导出格式") @RequestParam(defaultValue = "excel") String format) {
        
        String fileUrl = departmentService.exportDepartments(format);
        return Result.succeed(fileUrl);
    }

    /**
     * 获取部门下级列表
     */
    @ApiOperation("获取部门下级列表")
    @GetMapping("/{id}/children")
    public Result<List<DepartmentVO>> getDepartmentChildren(@ApiParam("部门ID") @PathVariable Integer id) {
        List<DepartmentVO> children = departmentService.getDepartmentChildren(id);
        return Result.succeed(children);
    }

    /**
     * 获取部门路径
     */
    @ApiOperation("获取部门路径")
    @GetMapping("/{id}/path")
    public Result<String> getDepartmentPath(@ApiParam("部门ID") @PathVariable Integer id) {
        String path = departmentService.getDepartmentPath(id);
        return Result.succeed(path);
    }

    /**
     * 校验部门编号是否唯一
     */
    @ApiOperation("校验部门编号是否唯一")
    @GetMapping("/check-code")
    public Result<Boolean> checkDepartmentCode(
            @ApiParam("部门编号") @RequestParam String depNo,
            @ApiParam("排除的部门ID") @RequestParam(required = false) Integer excludeId) {
        
        Boolean isUnique = departmentService.checkDepartmentCode(depNo, excludeId);
        return Result.succeed(isUnique);
    }
} 