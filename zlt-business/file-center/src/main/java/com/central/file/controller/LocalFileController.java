package com.central.file.controller;

import com.central.file.service.IFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * 本地文件访问控制器
 */
@RestController
@RequiredArgsConstructor
public class LocalFileController {
    private final IFileService fileService;

    /**
     * 访问本地存储的文件
     * @param id 文件ID
     */
    @GetMapping("/files/local/{id}")
    public void getLocalFile(@PathVariable String id, HttpServletResponse response) throws IOException {
        response.setContentType("image/*");
        fileService.out(id, response.getOutputStream());
    }
}
