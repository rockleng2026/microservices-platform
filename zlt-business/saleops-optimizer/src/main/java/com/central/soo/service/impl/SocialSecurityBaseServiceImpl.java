package com.central.soo.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.soo.mapper.SocialSecurityBaseMapper;
import com.central.soo.model.SocialSecurityBase;
import com.central.soo.model.dto.SocialSecurityBaseQueryDTO;
import com.central.soo.service.ISocialSecurityBaseService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 社保公积金基数配置服务实现
 *
 * @author Portal Team
 * @since 2024-12-19
 */
@Service
public class SocialSecurityBaseServiceImpl extends ServiceImpl<SocialSecurityBaseMapper, SocialSecurityBase> implements ISocialSecurityBaseService {

    @Override
    public IPage<SocialSecurityBase> pageSocialSecurityBase(SocialSecurityBaseQueryDTO query) {
        Page<SocialSecurityBase> page = new Page<>(query.getPageNum(), query.getPageSize());
        
        QueryWrapper<SocialSecurityBase> qw = new QueryWrapper<>();
        
        // 地区筛选
        if (StringUtils.hasText(query.getRegion())) {
            qw.eq("region", query.getRegion());
        }
        
        // 年度筛选
        if (query.getYear() != null) {
            qw.eq("year", query.getYear());
        }
        
        // 年度范围筛选
        if (query.getStartYear() != null) {
            qw.ge("year", query.getStartYear());
        }
        if (query.getEndYear() != null) {
            qw.le("year", query.getEndYear());
        }
        
        // 状态筛选
        if (query.getStatus() != null) {
            qw.eq("status", query.getStatus());
        }
        
        qw.eq("delflag", 0);
        qw.orderByDesc("year", "region");
        
        return this.page(page, qw);
    }

    @Override
    public boolean checkUnique(String region, Integer year, Long excludeId) {
        QueryWrapper<SocialSecurityBase> qw = new QueryWrapper<>();
        qw.eq("region", region);
        qw.eq("year", year);
        qw.eq("delflag", 0);
        if (excludeId != null) {
            qw.ne("id", excludeId);
        }
        return this.count(qw) == 0;
    }

    @Override
    public SocialSecurityBase getByRegionAndYear(String region, Integer year) {
        QueryWrapper<SocialSecurityBase> qw = new QueryWrapper<>();
        qw.eq("region", region);
        qw.eq("year", year);
        qw.eq("status", 1);
        qw.eq("delflag", 0);
        qw.orderByDesc("effective_date");
        qw.last("LIMIT 1");
        return this.getOne(qw);
    }

    @Override
    public List<Map<String, Object>> getRegionList() {
        // 返回常用地区列表
        List<Map<String, Object>> result = new ArrayList<>();
        
        String[] regions = {"BEIJING", "SHANGHAI", "GUANGZHOU", "SHENZHEN", "HANGZHOU", "NANJING", "WUHAN", "CHENGDU", "XIAN", "CHONGQING"};
        String[] regionNames = {"北京", "上海", "广州", "深圳", "杭州", "南京", "武汉", "成都", "西安", "重庆"};
        
        for (int i = 0; i < regions.length; i++) {
            Map<String, Object> region = new HashMap<>();
            region.put("code", regions[i]);
            region.put("name", regionNames[i]);
            result.add(region);
        }
        
        return result;
    }

    @Override
    public List<Integer> getYearList() {
        // 返回当前年度前后5年的年度列表
        List<Integer> years = new ArrayList<>();
        int currentYear = LocalDate.now().getYear();
        
        for (int i = currentYear - 5; i <= currentYear + 5; i++) {
            years.add(i);
        }
        
        return years;
    }

    @Override
    public int copyFromPreviousYear(Integer sourceYear, Integer targetYear, List<String> regions) {
        try {
            QueryWrapper<SocialSecurityBase> sourceQuery = new QueryWrapper<>();
            sourceQuery.eq("year", sourceYear);
            sourceQuery.eq("status", 1);
            sourceQuery.eq("delflag", 0);
            
            if (regions != null && !regions.isEmpty()) {
                sourceQuery.in("region", regions);
            }
            
            List<SocialSecurityBase> sourceConfigs = this.list(sourceQuery);
            
            if (sourceConfigs.isEmpty()) {
                return 0;
            }
            
            List<SocialSecurityBase> newConfigs = new ArrayList<>();
            
            for (SocialSecurityBase sourceConfig : sourceConfigs) {
                // 检查目标年度是否已存在配置
                if (!checkUnique(sourceConfig.getRegion(), targetYear, null)) {
                    continue; // 跳过已存在的配置
                }
                
                SocialSecurityBase newConfig = new SocialSecurityBase();
                // 复制所有字段除了ID和年度
                newConfig.setRegion(sourceConfig.getRegion());
                newConfig.setYear(targetYear);
                newConfig.setSocialSecurityBaseUpper(sourceConfig.getSocialSecurityBaseUpper());
                newConfig.setSocialSecurityBaseLower(sourceConfig.getSocialSecurityBaseLower());
                newConfig.setHousingFundBaseUpper(sourceConfig.getHousingFundBaseUpper());
                newConfig.setHousingFundBaseLower(sourceConfig.getHousingFundBaseLower());
                
                // 复制比例
                newConfig.setPensionPersonalRatio(sourceConfig.getPensionPersonalRatio());
                newConfig.setMedicalPersonalRatio(sourceConfig.getMedicalPersonalRatio());
                newConfig.setUnemploymentPersonalRatio(sourceConfig.getUnemploymentPersonalRatio());
                newConfig.setHousingFundPersonalRatio(sourceConfig.getHousingFundPersonalRatio());
                
                newConfig.setPensionCompanyRatio(sourceConfig.getPensionCompanyRatio());
                newConfig.setMedicalCompanyRatio(sourceConfig.getMedicalCompanyRatio());
                newConfig.setUnemploymentCompanyRatio(sourceConfig.getUnemploymentCompanyRatio());
                newConfig.setMaternityCompanyRatio(sourceConfig.getMaternityCompanyRatio());
                newConfig.setInjuryCompanyRatio(sourceConfig.getInjuryCompanyRatio());
                newConfig.setHousingFundCompanyRatio(sourceConfig.getHousingFundCompanyRatio());
                
                // 设置新的生效日期为目标年度的1月1日
                newConfig.setEffectiveDate(LocalDate.of(targetYear, 1, 1));
                newConfig.setStatus(1);
                newConfig.setRemark("从" + sourceYear + "年度复制");
                
                newConfigs.add(newConfig);
            }
            
            if (!newConfigs.isEmpty()) {
                this.saveBatch(newConfigs);
                return newConfigs.size();
            }
            
            return 0;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }
} 