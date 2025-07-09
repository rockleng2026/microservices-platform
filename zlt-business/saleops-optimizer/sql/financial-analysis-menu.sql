/*
 财务分析功能菜单配置 - 盈策通决策平台
 
 功能模块：
 - 盈亏平衡分析
 - 敏感性分析  
 - 场景对比分析
 - 成本结构分析
 - 投资回报分析
 
 Date: 2024/01/15
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- 财务分析菜单数据插入
-- ----------------------------

-- 1. 财务分析主菜单 (盈策通决策平台下的二级菜单)
INSERT INTO `menu_page` VALUES (450, '财务分析', 400, '/saleops-optimizer/financial-analysis', '财务分析决策中心', NULL, 'fund', 5, 1, 0, NOW(), 'default', NULL, NULL, NULL);

-- 2. 盈亏平衡分析
INSERT INTO `menu_page` VALUES (451, '盈亏平衡分析', 450, '/saleops-optimizer/financial-analysis/breakeven-analysis', '盈亏平衡点计算与分析', NULL, 'balance', 1, 1, 0, NOW(), 'default', NULL, NULL, NULL);

-- 3. 敏感性分析
INSERT INTO `menu_page` VALUES (452, '敏感性分析', 450, '/saleops-optimizer/financial-analysis/sensitivity-analysis', '参数敏感性影响分析', NULL, 'radar-chart', 2, 1, 0, NOW(), 'default', NULL, NULL, NULL);

-- 4. 场景对比分析
INSERT INTO `menu_page` VALUES (453, '场景对比分析', 450, '/saleops-optimizer/financial-analysis/scenario-comparison', '多场景方案对比分析', NULL, 'diff', 3, 1, 0, NOW(), 'default', NULL, NULL, NULL);

-- 5. 成本结构分析
INSERT INTO `menu_page` VALUES (454, '成本结构分析', 450, '/saleops-optimizer/financial-analysis/cost-structure', '企业成本构成分析', NULL, 'pie-chart', 4, 1, 0, NOW(), 'default', NULL, NULL, NULL);

-- 6. 投资回报分析
INSERT INTO `menu_page` VALUES (455, '投资回报分析', 450, '/saleops-optimizer/financial-analysis/roi-analysis', '投资收益率计算分析', NULL, 'rise', 5, 1, 0, NOW(), 'default', NULL, NULL, NULL);

-- 7. 财务预测建模
INSERT INTO `menu_page` VALUES (456, '财务预测建模', 450, '/saleops-optimizer/financial-analysis/forecast-modeling', '财务数据预测建模', NULL, 'line-chart', 6, 1, 0, NOW(), 'default', NULL, NULL, NULL);

-- 8. 风险评估中心
INSERT INTO `menu_page` VALUES (457, '风险评估中心', 450, '/saleops-optimizer/financial-analysis/risk-assessment', '财务风险识别评估', NULL, 'alert', 7, 1, 0, NOW(), 'default', NULL, NULL, NULL);

-- 9. 分析报表中心
INSERT INTO `menu_page` VALUES (458, '分析报表中心', 450, '/saleops-optimizer/financial-analysis/report-center', '财务分析报表管理', NULL, 'file-excel', 8, 1, 0, NOW(), 'default', NULL, NULL, NULL);

-- 10. 分析模板管理
INSERT INTO `menu_page` VALUES (459, '分析模板管理', 450, '/saleops-optimizer/financial-analysis/template-management', '分析场景模板管理', NULL, 'folder-open', 9, 1, 0, NOW(), 'default', NULL, NULL, NULL);

-- ----------------------------
-- 更新现有菜单排序 (调整盈策通决策平台下其他菜单的排序)
-- ----------------------------

-- 将历史记录菜单排序后移，为财务分析让位
UPDATE `menu_page` SET `sort_order` = 6 WHERE `id` = 412 AND `name` = '历史记录';

-- 调整薪酬管理菜单排序
UPDATE `menu_page` SET `sort_order` = 4 WHERE `id` = 407 AND `name` = '薪酬管理';

-- 调整决策数据看板排序
UPDATE `menu_page` SET `sort_order` = 7 WHERE `id` = 411 AND `name` = '决策数据看板';

-- ----------------------------
-- 财务分析功能权限数据 (如果需要细粒度权限控制)
-- ----------------------------

-- 创建功能权限表数据 (可选，根据系统权限设计决定是否需要)
/*
INSERT INTO `sys_permission` VALUES (4501, '财务分析查看', 'financial:analysis:view', '财务分析模块查看权限', 450);
INSERT INTO `sys_permission` VALUES (4502, '盈亏平衡分析', 'financial:breakeven:manage', '盈亏平衡分析权限', 451);
INSERT INTO `sys_permission` VALUES (4503, '敏感性分析', 'financial:sensitivity:manage', '敏感性分析权限', 452);
INSERT INTO `sys_permission` VALUES (4504, '场景对比分析', 'financial:scenario:manage', '场景对比分析权限', 453);
INSERT INTO `sys_permission` VALUES (4505, '成本结构分析', 'financial:cost:manage', '成本结构分析权限', 454);
INSERT INTO `sys_permission` VALUES (4506, '投资回报分析', 'financial:roi:manage', '投资回报分析权限', 455);
INSERT INTO `sys_permission` VALUES (4507, '财务预测建模', 'financial:forecast:manage', '财务预测建模权限', 456);
INSERT INTO `sys_permission` VALUES (4508, '风险评估', 'financial:risk:manage', '风险评估权限', 457);
INSERT INTO `sys_permission` VALUES (4509, '分析报表', 'financial:report:manage', '分析报表权限', 458);
INSERT INTO `sys_permission` VALUES (4510, '模板管理', 'financial:template:manage', '模板管理权限', 459);
*/

-- ----------------------------
-- 验证菜单层级结构
-- ----------------------------

-- 查询盈策通决策平台下的完整菜单结构
/*
SELECT 
    m1.id as level1_id,
    m1.name as level1_name,
    m1.sort_order as level1_sort,
    m2.id as level2_id,
    m2.name as level2_name,
    m2.sort_order as level2_sort,
    m3.id as level3_id,
    m3.name as level3_name,
    m3.sort_order as level3_sort,
    m3.link_url
FROM menu_page m1
LEFT JOIN menu_page m2 ON m1.id = m2.parent_id
LEFT JOIN menu_page m3 ON m2.id = m3.parent_id
WHERE m1.id = 400
ORDER BY m1.sort_order, m2.sort_order, m3.sort_order;
*/

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------
-- 菜单结构说明
-- ----------------------------
/*
盈策通决策平台 (400)
├── 基础配置 (401)
├── 月度绩效管理 (402)  
├── 薪酬管理 (407)
│   ├── 薪酬计算 (408)
│   ├── 工资查询 (409)
│   └── 工资条生成 (410)
├── 财务分析 (450) 🆕
│   ├── 盈亏平衡分析 (451) 🆕
│   ├── 敏感性分析 (452) 🆕
│   ├── 场景对比分析 (453) 🆕
│   ├── 成本结构分析 (454) 🆕
│   ├── 投资回报分析 (455) 🆕
│   ├── 财务预测建模 (456) 🆕
│   ├── 风险评估中心 (457) 🆕
│   ├── 分析报表中心 (458) 🆕
│   └── 分析模板管理 (459) 🆕
├── 历史记录 (412)
└── 决策数据看板 (411)
*/ 