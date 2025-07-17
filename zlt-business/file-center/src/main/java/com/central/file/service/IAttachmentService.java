package com.central.file.service;

import com.central.file.model.CommonAttachment;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface IAttachmentService {
    List<CommonAttachment> upload(MultipartFile[] files, String bizType, Long bizId, Integer sortOrder, String tenantId, Long userId);
    void bind(Long attachmentId, String bizType, Long bizId, String tenantId, Long userId);
    void unbind(Long attachmentId, String bizType, Long bizId, String tenantId, Long userId);
    List<CommonAttachment> list(String bizType, Long bizId, String tenantId, int page, int size);
    void delete(Long attachmentId, String tenantId, Long userId);
} 