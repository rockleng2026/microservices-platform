package com.central.file.service.impl;

import com.central.oss.model.ObjectInfo;
import com.central.oss.properties.FileServerProperties;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.io.FileInputStream;
import java.io.InputStream;

@Service
@ConditionalOnProperty(prefix = com.central.oss.properties.FileServerProperties.PREFIX, name = "type", havingValue = FileServerProperties.TYPE_LOCAL)
public class LocalFileService extends AbstractIFileService {
    private static final String BASE_PATH = System.getProperty("user.home") + "/file-center-data/files/"; // 绝对路径
    // 网关地址前缀，图片URL通过网关访问
    private static final String GATEWAY_BASE = "http://localhost:9900/api-file";

    @Override
    protected String fileType() {
        return "local";
    }

    @Override
    protected ObjectInfo uploadFile(MultipartFile file) {
        String fileKey = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        String filePath = BASE_PATH + fileKey;
        File dest = new File(filePath);
        try {
            if (!dest.getParentFile().exists()) {
                dest.getParentFile().mkdirs();
            }
            file.transferTo(dest);
        } catch (IOException e) {
            throw new RuntimeException("本地文件保存失败", e);
        }
        ObjectInfo info = new ObjectInfo();
        info.setObjectPath(filePath);
        info.setObjectUrl(GATEWAY_BASE + "/files/local/" + fileKey); // 通过网关访问的URL
        return info;
    }

    @Override
    protected void deleteFile(String objectPath) {
        File file = new File(objectPath);
        if (file.exists()) {
            file.delete();
        }
    }

    @Override
    public void out(String id, OutputStream os) {
        // id 是 fileKey（如 "1778474470821_logo.png"），path 列存的是完整路径
        // 用 like 查询找到对应记录（fileKey 在 path 末尾，唯一）
        com.central.file.model.FileInfo fileInfo = baseMapper.selectOne(
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<com.central.file.model.FileInfo>()
                .like(com.central.file.model.FileInfo::getPath, id)
                .last("LIMIT 1")
        );
        if (fileInfo != null) {
            try (InputStream in = new FileInputStream(fileInfo.getPath())) {
                byte[] buffer = new byte[4096];
                int len;
                while ((len = in.read(buffer)) != -1) {
                    os.write(buffer, 0, len);
                }
                os.flush();
            } catch (IOException e) {
                throw new RuntimeException("本地文件下载失败", e);
            }
        }
    }
} 