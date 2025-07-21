package com.central.project.service;

import com.central.project.model.ProjectAccrualConfig;
import java.util.List;

public interface IProjectAccrualConfigService {
    List<ProjectAccrualConfig> getByProjectId(Long projectId);
    void saveOrUpdateBatch(List<ProjectAccrualConfig> configs, Long projectId);
} 