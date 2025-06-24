-- ===================================================================
-- 项目管理、绩效管理、薪酬管理模块菜单初始化脚本
-- 基于系统现有的 menu_page 和 menu_func 表结构
-- ===================================================================

-- ===================================================================
-- 1. 项目管理模块菜单
-- ===================================================================

-- 项目管理一级菜单
INSERT INTO menu_page (id, name, parent_id, link_url, description, icon, sort_order, status, delflag, created_at, tenant_id) VALUES
(100, '项目管理', 0, '/project', '项目全生命周期管理', 'project', 10, 1, 0, NOW(), 'default');

-- 项目管理二级菜单
INSERT INTO menu_page (id, name, parent_id, link_url, description, icon, sort_order, status, delflag, created_at, tenant_id) VALUES
(101, '项目列表', 100, '/project/list', '项目列表管理', 'unordered-list', 1, 1, 0, NOW(), 'default'),
(102, '我的项目', 100, '/project/my', '我参与的项目', 'user', 2, 1, 0, NOW(), 'default'),
(103, '项目审批', 100, '/project/approval', '项目立项和结项审批', 'audit', 3, 1, 0, NOW(), 'default'),
(104, '项目统计', 100, '/project/statistics', '项目数据统计分析', 'bar-chart', 4, 1, 0, NOW(), 'default'),
(105, '项目模板', 100, '/project/template', '项目模板管理', 'copy', 5, 1, 0, NOW(), 'default'),
(106, '产品毛利配置', 100, '/project/profit-guide', '产品毛利分配指导配置', 'dollar', 6, 1, 0, NOW(), 'default');

-- 项目管理功能权限
INSERT INTO menu_func (perm_code, perm_name, perm_type, menu_page_id, sort_order, description, created_at, tenant_id) VALUES
-- 项目列表权限
('project:list:view', '查看项目', 1, 101, 1, '查看项目列表和详情', NOW(), 'default'),
('project:list:add', '新增项目', 1, 101, 2, '创建新项目', NOW(), 'default'),
('project:list:edit', '编辑项目', 1, 101, 3, '编辑项目信息', NOW(), 'default'),
('project:list:delete', '删除项目', 1, 101, 4, '删除项目（软删除）', NOW(), 'default'),
('project:list:status', '更新状态', 1, 101, 5, '更新项目状态', NOW(), 'default'),
('project:list:export', '导出项目', 1, 101, 6, '导出项目数据', NOW(), 'default'),
('project:list:import', '导入项目', 1, 101, 7, '批量导入项目', NOW(), 'default'),

-- 项目参与人权限
('project:participant:view', '查看参与人', 1, 101, 8, '查看项目参与人', NOW(), 'default'),
('project:participant:add', '添加参与人', 1, 101, 9, '添加项目参与人', NOW(), 'default'),
('project:participant:remove', '移除参与人', 1, 101, 10, '移除项目参与人', NOW(), 'default'),
('project:participant:role', '更新角色', 1, 101, 11, '更新参与人角色', NOW(), 'default'),

-- 我的项目权限
('project:my:view', '查看我的项目', 1, 102, 1, '查看我参与的项目', NOW(), 'default'),
('project:my:update', '更新项目进度', 1, 102, 2, '更新项目进度信息', NOW(), 'default'),

-- 项目审批权限
('project:approval:view', '查看审批', 1, 103, 1, '查看项目审批列表', NOW(), 'default'),
('project:approval:approve', '审批通过', 1, 103, 2, '审批项目通过', NOW(), 'default'),
('project:approval:reject', '审批拒绝', 1, 103, 3, '审批项目拒绝', NOW(), 'default'),
('project:approval:history', '审批历史', 1, 103, 4, '查看审批历史记录', NOW(), 'default'),

-- 项目统计权限
('project:statistics:view', '查看统计', 1, 104, 1, '查看项目统计数据', NOW(), 'default'),
('project:statistics:export', '导出统计', 1, 104, 2, '导出统计报表', NOW(), 'default'),

-- 项目模板权限
('project:template:view', '查看模板', 1, 105, 1, '查看项目模板', NOW(), 'default'),
('project:template:add', '新增模板', 1, 105, 2, '新增项目模板', NOW(), 'default'),
('project:template:edit', '编辑模板', 1, 105, 3, '编辑项目模板', NOW(), 'default'),
('project:template:delete', '删除模板', 1, 105, 4, '删除项目模板', NOW(), 'default'),

-- 产品毛利配置权限
('project:profit-guide:view', '查看配置', 1, 106, 1, '查看毛利分配配置', NOW(), 'default'),
('project:profit-guide:add', '新增配置', 1, 106, 2, '新增毛利分配配置', NOW(), 'default'),
('project:profit-guide:edit', '编辑配置', 1, 106, 3, '编辑毛利分配配置', NOW(), 'default'),
('project:profit-guide:delete', '删除配置', 1, 106, 4, '删除毛利分配配置', NOW(), 'default');

-- ===================================================================
-- 2. 绩效管理模块菜单
-- ===================================================================

-- 绩效管理一级菜单
INSERT INTO menu_page (id, name, parent_id, link_url, description, icon, sort_order, status, delflag, created_at, tenant_id) VALUES
(200, '绩效管理', 0, '/performance', '员工绩效考核管理', 'dashboard', 11, 1, 0, NOW(), 'default');

-- 绩效管理二级菜单
INSERT INTO menu_page (id, name, parent_id, link_url, description, icon, sort_order, status, delflag, created_at, tenant_id) VALUES
(201, '绩效考核', 200, '/performance/appraisal', '绩效考核评估', 'form', 1, 1, 0, NOW(), 'default'),
(202, '我的绩效', 200, '/performance/my', '个人绩效查看', 'user', 2, 1, 0, NOW(), 'default'),
(203, '绩效审批', 200, '/performance/approval', '绩效考核审批', 'check-circle', 3, 1, 0, NOW(), 'default'),
(204, '绩效指标', 200, '/performance/indicator', '绩效指标管理', 'aim', 4, 1, 0, NOW(), 'default'),
(205, '考核周期', 200, '/performance/cycle', '考核周期管理', 'calendar', 5, 1, 0, NOW(), 'default'),
(206, '绩效报表', 200, '/performance/report', '绩效统计报表', 'line-chart', 6, 1, 0, NOW(), 'default'),
(207, '绩效排名', 200, '/performance/ranking', '绩效排名榜', 'trophy', 7, 1, 0, NOW(), 'default'),
(208, '绩效设置', 200, '/performance/config', '绩效系统配置', 'setting', 8, 1, 0, NOW(), 'default');

-- 绩效管理功能权限
INSERT INTO menu_func (perm_code, perm_name, perm_type, menu_page_id, sort_order, description, created_at, tenant_id) VALUES
-- 绩效考核权限
('performance:appraisal:view', '查看考核', 1, 201, 1, '查看绩效考核记录', NOW(), 'default'),
('performance:appraisal:add', '新增考核', 1, 201, 2, '新增绩效考核', NOW(), 'default'),
('performance:appraisal:edit', '编辑考核', 1, 201, 3, '编辑绩效考核', NOW(), 'default'),
('performance:appraisal:delete', '删除考核', 1, 201, 4, '删除绩效考核', NOW(), 'default'),
('performance:appraisal:submit', '提交考核', 1, 201, 5, '提交绩效考核', NOW(), 'default'),
('performance:appraisal:score', '评分考核', 1, 201, 6, '对考核进行评分', NOW(), 'default'),

-- 我的绩效权限
('performance:my:view', '查看我的绩效', 1, 202, 1, '查看个人绩效记录', NOW(), 'default'),
('performance:my:self-assess', '自我评估', 1, 202, 2, '进行自我评估', NOW(), 'default'),

-- 绩效审批权限
('performance:approval:view', '查看审批', 1, 203, 1, '查看绩效审批列表', NOW(), 'default'),
('performance:approval:approve', '审批通过', 1, 203, 2, '审批绩效通过', NOW(), 'default'),
('performance:approval:reject', '审批拒绝', 1, 203, 3, '审批绩效拒绝', NOW(), 'default'),

-- 绩效指标权限
('performance:indicator:view', '查看指标', 1, 204, 1, '查看绩效指标', NOW(), 'default'),
('performance:indicator:add', '新增指标', 1, 204, 2, '新增绩效指标', NOW(), 'default'),
('performance:indicator:edit', '编辑指标', 1, 204, 3, '编辑绩效指标', NOW(), 'default'),
('performance:indicator:delete', '删除指标', 1, 204, 4, '删除绩效指标', NOW(), 'default'),

-- 考核周期权限
('performance:cycle:view', '查看周期', 1, 205, 1, '查看考核周期', NOW(), 'default'),
('performance:cycle:add', '新增周期', 1, 205, 2, '新增考核周期', NOW(), 'default'),
('performance:cycle:edit', '编辑周期', 1, 205, 3, '编辑考核周期', NOW(), 'default'),
('performance:cycle:delete', '删除周期', 1, 205, 4, '删除考核周期', NOW(), 'default'),
('performance:cycle:activate', '激活周期', 1, 205, 5, '激活考核周期', NOW(), 'default'),

-- 绩效报表权限
('performance:report:view', '查看报表', 1, 206, 1, '查看绩效报表', NOW(), 'default'),
('performance:report:export', '导出报表', 1, 206, 2, '导出绩效报表', NOW(), 'default'),

-- 绩效排名权限
('performance:ranking:view', '查看排名', 1, 207, 1, '查看绩效排名', NOW(), 'default'),

-- 绩效设置权限
('performance:config:view', '查看设置', 1, 208, 1, '查看绩效设置', NOW(), 'default'),
('performance:config:edit', '编辑设置', 1, 208, 2, '编辑绩效设置', NOW(), 'default');

-- ===================================================================
-- 3. 薪酬管理模块菜单
-- ===================================================================

-- 薪酬管理一级菜单
INSERT INTO menu_page (id, name, parent_id, link_url, description, icon, sort_order, status, delflag, created_at, tenant_id) VALUES
(300, '薪酬管理', 0, '/salary', '员工薪酬福利管理', 'money-collect', 12, 1, 0, NOW(), 'default');

-- 薪酬管理二级菜单
INSERT INTO menu_page (id, name, parent_id, link_url, description, icon, sort_order, status, delflag, created_at, tenant_id) VALUES
(301, '薪资核算', 300, '/salary/calculation', '员工薪资核算', 'calculator', 1, 1, 0, NOW(), 'default'),
(302, '工资条', 300, '/salary/payslip', '工资条查看和发放', 'file-text', 2, 1, 0, NOW(), 'default'),
(303, '薪资调整', 300, '/salary/adjustment', '薪资调整申请审批', 'rise', 3, 1, 0, NOW(), 'default'),
(304, '薪资结构', 300, '/salary/structure', '薪资结构设置', 'build', 4, 1, 0, NOW(), 'default'),
(305, '福利管理', 300, '/salary/benefit', '员工福利管理', 'heart', 5, 1, 0, NOW(), 'default'),
(306, '社保管理', 300, '/salary/insurance', '社保公积金管理', 'safety', 6, 1, 0, NOW(), 'default'),
(307, '个税管理', 300, '/salary/tax', '个人所得税管理', 'bank', 7, 1, 0, NOW(), 'default'),
(308, '薪资报表', 300, '/salary/report', '薪资统计报表', 'fund', 8, 1, 0, NOW(), 'default'),
(309, '薪资设置', 300, '/salary/config', '薪资系统配置', 'tool', 9, 1, 0, NOW(), 'default');

-- 薪酬管理功能权限
INSERT INTO menu_func (perm_code, perm_name, perm_type, menu_page_id, sort_order, description, created_at, tenant_id) VALUES
-- 薪资核算权限
('salary:calculation:view', '查看核算', 1, 301, 1, '查看薪资核算记录', NOW(), 'default'),
('salary:calculation:add', '新增核算', 1, 301, 2, '新增薪资核算', NOW(), 'default'),
('salary:calculation:edit', '编辑核算', 1, 301, 3, '编辑薪资核算', NOW(), 'default'),
('salary:calculation:delete', '删除核算', 1, 301, 4, '删除薪资核算', NOW(), 'default'),
('salary:calculation:confirm', '确认核算', 1, 301, 5, '确认薪资核算', NOW(), 'default'),
('salary:calculation:batch', '批量核算', 1, 301, 6, '批量薪资核算', NOW(), 'default'),

-- 工资条权限
('salary:payslip:view', '查看工资条', 1, 302, 1, '查看员工工资条', NOW(), 'default'),
('salary:payslip:generate', '生成工资条', 1, 302, 2, '生成员工工资条', NOW(), 'default'),
('salary:payslip:send', '发送工资条', 1, 302, 3, '发送工资条给员工', NOW(), 'default'),
('salary:payslip:export', '导出工资条', 1, 302, 4, '导出工资条数据', NOW(), 'default'),
('salary:payslip:my', '我的工资条', 1, 302, 5, '查看个人工资条', NOW(), 'default'),

-- 薪资调整权限
('salary:adjustment:view', '查看调整', 1, 303, 1, '查看薪资调整记录', NOW(), 'default'),
('salary:adjustment:add', '新增调整', 1, 303, 2, '新增薪资调整申请', NOW(), 'default'),
('salary:adjustment:edit', '编辑调整', 1, 303, 3, '编辑薪资调整', NOW(), 'default'),
('salary:adjustment:delete', '删除调整', 1, 303, 4, '删除薪资调整', NOW(), 'default'),
('salary:adjustment:approve', '审批调整', 1, 303, 5, '审批薪资调整', NOW(), 'default'),
('salary:adjustment:reject', '拒绝调整', 1, 303, 6, '拒绝薪资调整', NOW(), 'default'),

-- 薪资结构权限
('salary:structure:view', '查看结构', 1, 304, 1, '查看薪资结构', NOW(), 'default'),
('salary:structure:add', '新增结构', 1, 304, 2, '新增薪资结构', NOW(), 'default'),
('salary:structure:edit', '编辑结构', 1, 304, 3, '编辑薪资结构', NOW(), 'default'),
('salary:structure:delete', '删除结构', 1, 304, 4, '删除薪资结构', NOW(), 'default'),

-- 福利管理权限
('salary:benefit:view', '查看福利', 1, 305, 1, '查看员工福利', NOW(), 'default'),
('salary:benefit:add', '新增福利', 1, 305, 2, '新增员工福利', NOW(), 'default'),
('salary:benefit:edit', '编辑福利', 1, 305, 3, '编辑员工福利', NOW(), 'default'),
('salary:benefit:delete', '删除福利', 1, 305, 4, '删除员工福利', NOW(), 'default'),
('salary:benefit:assign', '分配福利', 1, 305, 5, '为员工分配福利', NOW(), 'default'),

-- 社保管理权限
('salary:insurance:view', '查看社保', 1, 306, 1, '查看社保记录', NOW(), 'default'),
('salary:insurance:add', '新增社保', 1, 306, 2, '新增社保记录', NOW(), 'default'),
('salary:insurance:edit', '编辑社保', 1, 306, 3, '编辑社保记录', NOW(), 'default'),
('salary:insurance:delete', '删除社保', 1, 306, 4, '删除社保记录', NOW(), 'default'),
('salary:insurance:calculate', '计算社保', 1, 306, 5, '计算社保费用', NOW(), 'default'),

-- 个税管理权限
('salary:tax:view', '查看个税', 1, 307, 1, '查看个税记录', NOW(), 'default'),
('salary:tax:calculate', '计算个税', 1, 307, 2, '计算个人所得税', NOW(), 'default'),
('salary:tax:declare', '申报个税', 1, 307, 3, '申报个人所得税', NOW(), 'default'),
('salary:tax:config', '个税配置', 1, 307, 4, '配置个税计算规则', NOW(), 'default'),

-- 薪资报表权限
('salary:report:view', '查看报表', 1, 308, 1, '查看薪资报表', NOW(), 'default'),
('salary:report:export', '导出报表', 1, 308, 2, '导出薪资报表', NOW(), 'default'),
('salary:report:statistics', '薪资统计', 1, 308, 3, '薪资统计分析', NOW(), 'default'),

-- 薪资设置权限
('salary:config:view', '查看设置', 1, 309, 1, '查看薪资设置', NOW(), 'default'),
('salary:config:edit', '编辑设置', 1, 309, 2, '编辑薪资设置', NOW(), 'default'),
('salary:config:company', '公司设置', 1, 309, 3, '薪资公司级设置', NOW(), 'default');

-- ===================================================================
-- 4. 角色权限配置示例
-- ===================================================================

-- 假设系统已有基础角色，为不同角色分配相应权限
-- 这里提供配置示例，实际使用时需要根据具体的角色ID来配置

-- 系统管理员角色（假设ID为1）拥有所有权限
-- INSERT INTO sys_role_menu (role_id, menu_id) 
-- SELECT 1, id FROM menu_page WHERE id BETWEEN 100 AND 309;

-- 项目经理角色（假设ID为2）拥有项目管理权限
-- INSERT INTO sys_role_menu (role_id, menu_id) 
-- SELECT 2, id FROM menu_page WHERE id BETWEEN 100 AND 106;

-- HR管理员角色（假设ID为3）拥有绩效和薪酬管理权限
-- INSERT INTO sys_role_menu (role_id, menu_id) 
-- SELECT 3, id FROM menu_page WHERE id BETWEEN 200 AND 309;

-- 普通员工角色（假设ID为4）只有查看自己相关信息的权限
-- INSERT INTO sys_role_menu (role_id, menu_id) VALUES (4, 102), (4, 202), (4, 302);

-- ===================================================================
-- 5. 数据完整性检查
-- ===================================================================

-- 检查插入的菜单数据
SELECT 'menu_page' as table_name, COUNT(*) as record_count FROM menu_page WHERE id BETWEEN 100 AND 309
UNION ALL
SELECT 'menu_func' as table_name, COUNT(*) as record_count FROM menu_func WHERE menu_page_id BETWEEN 100 AND 309;

-- 显示菜单层级结构
SELECT 
    CASE 
        WHEN parent_id = 0 THEN CONCAT('├── ', name)
        ELSE CONCAT('│   ├── ', name)
    END as menu_structure,
    id,
    parent_id,
    link_url,
    icon
FROM menu_page 
WHERE id BETWEEN 100 AND 309 
ORDER BY parent_id, sort_order; 