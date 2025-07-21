package com.central.project.service;

import com.central.project.model.ProjectAccrualDetail;
import java.util.List;

public interface IProjectAccrualDetailService {
    List<ProjectAccrualDetail> getByProjectId(Long projectId);
    void saveOrUpdateBatch(List<ProjectAccrualDetail> details, Long projectId);
} 