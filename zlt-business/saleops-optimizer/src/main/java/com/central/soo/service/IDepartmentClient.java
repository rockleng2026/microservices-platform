package com.central.soo.service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import com.central.soo.service.IDepartmentClient.DepartmentDTO;
import com.central.common.model.Result;

@FeignClient(name = "organization-service", contextId = "departmentClient", path = "/api/organization/departments")
public interface IDepartmentClient {
    @GetMapping("/{id}")
    Result<DepartmentDTO> getDepartmentById(@PathVariable("id") Long id);

    class DepartmentDTO {
        public Long id;
        public String name;
    }
} 