package com.central.file.controller;

import com.central.file.model.CommonAttachment;
import com.central.file.service.IAttachmentService;
import com.central.common.model.Result;
import com.central.file.model.CommonAttachmentMeta;
import com.central.file.mapper.CommonAttachmentMetaMapper;
import com.central.common.context.TenantContextHolder;
import com.central.common.model.SysUser;
import com.central.common.utils.LoginUserUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/attachment")
public class AttachmentController {

    @Autowired
    private IAttachmentService attachmentService;

    @Autowired
    private CommonAttachmentMetaMapper metaMapper;

    @PostMapping("/upload")
    public Result<List<CommonAttachment>> upload(
        @RequestParam("file") MultipartFile[] files,
        @RequestParam(required = false) String bizType,
        @RequestParam(required = false) Long bizId,
        @RequestParam(required = false) Integer sortOrder
    ) {
        String tenantId = TenantContextHolder.getTenant();
        SysUser user = LoginUserUtils.getCurrentSysUser();
        Long userId = user != null ? user.getId() : null;
        return Result.succeed(attachmentService.upload(files, bizType, bizId, sortOrder, tenantId, userId));
    }

    /**
     * 查询附件元数据
     */
    @GetMapping("/meta")
    public Result<List<CommonAttachmentMeta>> getMeta(@RequestParam Long attachmentId) {
        String tenantId = TenantContextHolder.getTenant();
        List<CommonAttachmentMeta> metas = metaMapper.selectList(
            new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<CommonAttachmentMeta>()
                .eq("tenant_id", tenantId)
                .eq("attachment_id", attachmentId)
                .eq("delflag", 0)
        );
        return Result.succeed(metas);
    }

    /**
     * 新增/修改附件元数据
     */
    @PostMapping("/meta")
    public Result<Boolean> saveOrUpdateMeta(@RequestBody CommonAttachmentMeta meta) {
        String tenantId = TenantContextHolder.getTenant();
        meta.setTenantId(tenantId);
        com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<CommonAttachmentMeta> qw =
            new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<>();
        qw.eq("tenant_id", tenantId)
          .eq("attachment_id", meta.getAttachmentId())
          .eq("meta_key", meta.getMetaKey());
        CommonAttachmentMeta exist = metaMapper.selectOne(qw);
        if (exist != null) {
            meta.setCreatedAt(exist.getCreatedAt());
            meta.setCreatedBy(exist.getCreatedBy());
            meta.setUpdatedAt(new java.util.Date());
            meta.setDelflag(0);
            metaMapper.update(meta, qw);
        } else {
            meta.setCreatedAt(new java.util.Date());
            meta.setDelflag(0);
            metaMapper.insert(meta);
        }
        return Result.succeed(true);
    }

    /**
     * 批量新增/修改附件元数据
     */
    @PostMapping("/meta/batch")
    public Result<Boolean> batchSaveOrUpdateMeta(@RequestBody List<CommonAttachmentMeta> metas) {
        String tenantId = TenantContextHolder.getTenant();
        for (CommonAttachmentMeta meta : metas) {
            meta.setTenantId(tenantId);
            com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<CommonAttachmentMeta> qw =
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<>();
            qw.eq("tenant_id", tenantId)
              .eq("attachment_id", meta.getAttachmentId())
              .eq("meta_key", meta.getMetaKey());
            CommonAttachmentMeta exist = metaMapper.selectOne(qw);
            if (exist != null) {
                meta.setCreatedAt(exist.getCreatedAt());
                meta.setCreatedBy(exist.getCreatedBy());
                meta.setUpdatedAt(new java.util.Date());
                meta.setDelflag(0);
                metaMapper.update(meta, qw);
            } else {
                meta.setCreatedAt(new java.util.Date());
                meta.setDelflag(0);
                metaMapper.insert(meta);
            }
        }
        return Result.succeed(true);
    }

    /**
     * 删除附件元数据
     */
    @DeleteMapping("/meta")
    public Result<Boolean> deleteMeta(@RequestParam Long attachmentId, @RequestParam String metaKey) {
        String tenantId = TenantContextHolder.getTenant();
        com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper<CommonAttachmentMeta> uw =
            new com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper<>();
        uw.eq("tenant_id", tenantId)
          .eq("attachment_id", attachmentId)
          .eq("meta_key", metaKey);
        CommonAttachmentMeta meta = new CommonAttachmentMeta();
        meta.setDelflag(1);
        meta.setUpdatedAt(new java.util.Date());
        metaMapper.update(meta, uw);
        return Result.succeed(true);
    }

    // 其他接口同理
} 