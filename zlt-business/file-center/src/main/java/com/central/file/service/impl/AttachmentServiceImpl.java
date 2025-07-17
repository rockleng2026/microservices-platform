package com.central.file.service.impl;

import com.central.file.model.CommonAttachment;
import com.central.file.mapper.CommonAttachmentMapper;
import com.central.file.service.IAttachmentService;
import com.central.file.service.IFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;
import com.central.file.model.CommonAttachmentRel;
import com.central.file.mapper.CommonAttachmentRelMapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.central.common.exception.BusinessException;
import com.central.file.mapper.CommonAttachmentMetaMapper;
import com.central.file.model.CommonAttachmentMeta;

import javax.annotation.Resource;

@Service
public class AttachmentServiceImpl implements IAttachmentService {

    @Autowired
    private CommonAttachmentMapper attachmentMapper;

    @Autowired
    private CommonAttachmentRelMapper relMapper;
    @Autowired
    private CommonAttachmentMetaMapper metaMapper;

    @Resource
    private IFileService storageStrategy;

    @Override
    public List<CommonAttachment> upload(MultipartFile[] files, String bizType, Long bizId, Integer sortOrder, String tenantId, Long userId) {
        List<CommonAttachment> result = new ArrayList<>();
        for (MultipartFile file : files) {
            CommonAttachment att = new CommonAttachment();
            try {
                // 先上传文件，获取 FileInfo
                com.central.file.model.FileInfo fileInfo = storageStrategy.upload(file);
                String fileKey = fileInfo.getId();
                att.setFileKey(fileKey);
                att.setOriginalName(fileInfo.getName());
                att.setFileType(fileInfo.getContentType());
                att.setFileSize(fileInfo.getSize());
                att.setStorageType(fileInfo.getSource());
            } catch (Exception e) {
                throw new RuntimeException("文件上传失败", e);
            }
            att.setId(System.currentTimeMillis());
            att.setTenantId(tenantId);
            att.setMd5("");
            att.setUploadTime(new Date());
            att.setUploadUserId(userId);
            att.setSortOrder(sortOrder != null ? sortOrder : 0);
            att.setDelflag(0);
            att.setCreatedAt(new Date());
            att.setCreatedBy(userId);
            attachmentMapper.insert(att);
            // 元数据扩展示例：自动写入上传来源
            CommonAttachmentMeta meta = new CommonAttachmentMeta();
            meta.setTenantId(tenantId);
            meta.setAttachmentId(att.getId());
            meta.setMetaKey("upload_source");
            meta.setMetaValue("web");
            meta.setDelflag(0);
            meta.setCreatedAt(new Date());
            meta.setCreatedBy(userId);
            metaMapper.insert(meta);
            result.add(att);
        }
        return result;
    }

    @Override
    public void bind(Long attachmentId, String bizType, Long bizId, String tenantId, Long userId) {
        // 幂等性：绑定前查重
        QueryWrapper<CommonAttachmentRel> qw = new QueryWrapper<>();
        qw.eq("tenant_id", tenantId).eq("biz_id", bizId).eq("biz_type", bizType).eq("attachment_id", attachmentId).eq("delflag", 0);
        if (relMapper.selectCount(qw) > 0) return;
        CommonAttachmentRel rel = new CommonAttachmentRel();
        rel.setId(System.currentTimeMillis());
        rel.setTenantId(tenantId);
        rel.setBizId(bizId);
        rel.setBizType(bizType);
        rel.setAttachmentId(attachmentId);
        rel.setSortOrder(0);
        rel.setDelflag(0);
        rel.setCreatedAt(new Date());
        rel.setCreatedBy(userId);
        relMapper.insert(rel);
    }

    @Override
    public void unbind(Long attachmentId, String bizType, Long bizId, String tenantId, Long userId) {
        QueryWrapper<CommonAttachmentRel> qw = new QueryWrapper<>();
        qw.eq("tenant_id", tenantId).eq("biz_id", bizId).eq("biz_type", bizType).eq("attachment_id", attachmentId);
        CommonAttachmentRel rel = relMapper.selectOne(qw);
        if (rel != null) {
            rel.setDelflag(1);
            rel.setUpdatedAt(new Date());
            rel.setUpdatedBy(userId);
            relMapper.updateById(rel);
        }
    }

    @Override
    public List<CommonAttachment> list(String bizType, Long bizId, String tenantId, int page, int size) {
        QueryWrapper<CommonAttachmentRel> relQw = new QueryWrapper<>();
        relQw.eq("tenant_id", tenantId).eq("biz_id", bizId).eq("biz_type", bizType).eq("delflag", 0);
        relQw.orderByAsc("sort_order");
        List<CommonAttachmentRel> rels = relMapper.selectList(relQw);
        if (rels.isEmpty()) return Collections.emptyList();
        List<Long> attIds = rels.stream().map(CommonAttachmentRel::getAttachmentId).toList();
        com.baomidou.mybatisplus.extension.plugins.pagination.Page<CommonAttachment> pageObj = new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(page, size);
        QueryWrapper<CommonAttachment> attQw = new QueryWrapper<>();
        attQw.in("id", attIds).eq("tenant_id", tenantId).eq("delflag", 0);
        attQw.orderByAsc("sort_order");
        return attachmentMapper.selectPage(pageObj, attQw).getRecords();
    }

    @Override
    public void delete(Long attachmentId, String tenantId, Long userId) {
        CommonAttachment att = attachmentMapper.selectById(attachmentId);
        if (att == null || !tenantId.equals(att.getTenantId())) {
            throw new BusinessException("附件不存在或无权限", 1);
        }
        att.setDelflag(1);
        att.setUpdatedAt(new Date());
        att.setUpdatedBy(userId);
        attachmentMapper.updateById(att);
        // 同步逻辑删除所有绑定关系
        UpdateWrapper<CommonAttachmentRel> uw = new UpdateWrapper<>();
        uw.eq("attachment_id", attachmentId).eq("tenant_id", tenantId);
        CommonAttachmentRel rel = new CommonAttachmentRel();
        rel.setDelflag(1);
        rel.setUpdatedAt(new Date());
        rel.setUpdatedBy(userId);
        relMapper.update(rel, uw);
    }
} 