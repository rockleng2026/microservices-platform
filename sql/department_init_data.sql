-- ===================================================================
-- Portal 3.0 部门初始化数据脚本
-- 版本: v1.0
-- 创建时间: 2024-12-19
-- 描述: 为组织管理模块提供完整的部门层级结构初始化数据
-- ===================================================================

-- 设置字符集
SET NAMES utf8mb4;

-- ===================================================================
-- 1. 默认租户(default)的组织架构数据
-- ===================================================================

-- 1级部门 - 集团总部
INSERT INTO `department` (`id`, `name`, `director_id`, `parent_id`, `dep_no`, `grade_id`, `is_level`, `fiiale`, `filialemark`, `tel`, `address`, `description`, `sort_order`, `status`, `delflag`, `tenant_id`, `created_by`) VALUES
(1, '中科集团', NULL, 0, 'ZK001', 1, 1, '1', 'HQ', '010-88888888', '北京市海淀区中关村大街1号', '集团总部', 1, 1, 0, 'default', 1);

-- 2级部门 - 分公司/事业部
INSERT INTO `department` (`id`, `name`, `director_id`, `parent_id`, `dep_no`, `grade_id`, `is_level`, `fiiale`, `filialemark`, `tel`, `address`, `description`, `sort_order`, `status`, `delflag`, `tenant_id`, `created_by`) VALUES
(2, '北京分公司', NULL, 1, 'BJ001', 2, 2, '1', 'BJ', '010-66666666', '北京市朝阳区国贸大厦', '北京地区业务', 1, 1, 0, 'default', 1),
(3, '上海分公司', NULL, 1, 'SH001', 2, 2, '1', 'SH', '021-55555555', '上海市浦东新区陆家嘴', '上海地区业务', 2, 1, 0, 'default', 1),
(4, '深圳分公司', NULL, 1, 'SZ001', 2, 2, '1', 'SZ', '0755-44444444', '深圳市南山区科技园', '深圳地区业务', 3, 1, 0, 'default', 1),
(5, '技术事业部', NULL, 1, 'TECH001', 2, 2, '', '', '010-77777777', '北京市海淀区中关村大街1号A座', '技术研发中心', 4, 1, 0, 'default', 1),
(6, '市场事业部', NULL, 1, 'MKT001', 2, 2, '', '', '010-77777778', '北京市海淀区中关村大街1号B座', '市场营销中心', 5, 1, 0, 'default', 1);

-- 3级部门 - 主要业务部门
INSERT INTO `department` (`id`, `name`, `director_id`, `parent_id`, `dep_no`, `grade_id`, `is_level`, `fiiale`, `filialemark`, `tel`, `address`, `description`, `sort_order`, `status`, `delflag`, `tenant_id`, `created_by`) VALUES
-- 北京分公司下属部门
(7, '北京技术部', NULL, 2, 'BJJS', 3, 3, '', '', '010-66666601', '北京市朝阳区国贸大厦10层', '北京技术开发', 1, 1, 0, 'default', 1),
(8, '北京销售部', NULL, 2, 'BJXS', 3, 3, '', '', '010-66666602', '北京市朝阳区国贸大厦11层', '北京销售业务', 2, 1, 0, 'default', 1),
(9, '北京行政部', NULL, 2, 'BJXZ', 3, 3, '', '', '010-66666603', '北京市朝阳区国贸大厦12层', '北京行政管理', 3, 1, 0, 'default', 1),
-- 上海分公司下属部门
(10, '上海技术部', NULL, 3, 'SHJS', 3, 3, '', '', '021-55555501', '上海市浦东新区陆家嘴8层', '上海技术开发', 1, 1, 0, 'default', 1),
(11, '上海销售部', NULL, 3, 'SHXS', 3, 3, '', '', '021-55555502', '上海市浦东新区陆家嘴9层', '上海销售业务', 2, 1, 0, 'default', 1),
(12, '上海运营部', NULL, 3, 'SHYY', 3, 3, '', '', '021-55555503', '上海市浦东新区陆家嘴10层', '上海运营管理', 3, 1, 0, 'default', 1),
-- 深圳分公司下属部门
(13, '深圳研发部', NULL, 4, 'SZYF', 3, 3, '', '', '0755-44444401', '深圳市南山区科技园A栋', '深圳产品研发', 1, 1, 0, 'default', 1),
(14, '深圳市场部', NULL, 4, 'SZSC', 3, 3, '', '', '0755-44444402', '深圳市南山区科技园B栋', '深圳市场拓展', 2, 1, 0, 'default', 1),
-- 技术事业部下属部门
(15, '软件开发部', NULL, 5, 'RJKF', 3, 3, '', '', '010-77777701', '中关村大街1号A座5层', '软件产品开发', 1, 1, 0, 'default', 1),
(16, '硬件研发部', NULL, 5, 'YJYF', 3, 3, '', '', '010-77777702', '中关村大街1号A座6层', '硬件产品研发', 2, 1, 0, 'default', 1),
(17, '测试部', NULL, 5, 'CS', 3, 3, '', '', '010-77777703', '中关村大街1号A座7层', '产品质量测试', 3, 1, 0, 'default', 1),
-- 市场事业部下属部门
(18, '品牌营销部', NULL, 6, 'PPYX', 3, 3, '', '', '010-77777801', '中关村大街1号B座5层', '品牌建设推广', 1, 1, 0, 'default', 1),
(19, '渠道管理部', NULL, 6, 'QDGL', 3, 3, '', '', '010-77777802', '中关村大街1号B座6层', '销售渠道管理', 2, 1, 0, 'default', 1);

-- 4级部门 - 专业团队/组
INSERT INTO `department` (`id`, `name`, `director_id`, `parent_id`, `dep_no`, `grade_id`, `is_level`, `fiiale`, `filialemark`, `tel`, `address`, `description`, `sort_order`, `status`, `delflag`, `tenant_id`, `created_by`) VALUES
-- 软件开发部下属组
(20, '前端开发组', NULL, 15, 'QDKF', 4, 4, '', '', '010-77777711', '中关村大街1号A座501', '前端技术开发', 1, 1, 0, 'default', 1),
(21, '后端开发组', NULL, 15, 'HDKF', 4, 4, '', '', '010-77777712', '中关村大街1号A座502', '后端技术开发', 2, 1, 0, 'default', 1),
(22, '移动开发组', NULL, 15, 'YDKF', 4, 4, '', '', '010-77777713', '中关村大街1号A座503', '移动应用开发', 3, 1, 0, 'default', 1),
-- 硬件研发部下属组
(23, '硬件设计组', NULL, 16, 'YJSJ', 4, 4, '', '', '010-77777721', '中关村大街1号A座601', '硬件架构设计', 1, 1, 0, 'default', 1),
(24, '嵌入式组', NULL, 16, 'QRS', 4, 4, '', '', '010-77777722', '中关村大街1号A座602', '嵌入式系统开发', 2, 1, 0, 'default', 1),
-- 测试部下属组
(25, '功能测试组', NULL, 17, 'GNCS', 4, 4, '', '', '010-77777731', '中关村大街1号A座701', '功能测试验证', 1, 1, 0, 'default', 1),
(26, '性能测试组', NULL, 17, 'XNCS', 4, 4, '', '', '010-77777732', '中关村大街1号A座702', '性能压力测试', 2, 1, 0, 'default', 1),
-- 品牌营销部下属组
(27, '品牌策划组', NULL, 18, 'PPCH', 4, 4, '', '', '010-77777811', '中关村大街1号B座501', '品牌策划推广', 1, 1, 0, 'default', 1),
(28, '市场调研组', NULL, 18, 'SCDY', 4, 4, '', '', '010-77777812', '中关村大街1号B座502', '市场调查研究', 2, 1, 0, 'default', 1);

-- 5级部门 - 专项小组
INSERT INTO `department` (`id`, `name`, `director_id`, `parent_id`, `dep_no`, `grade_id`, `is_level`, `fiiale`, `filialemark`, `tel`, `address`, `description`, `sort_order`, `status`, `delflag`, `tenant_id`, `created_by`) VALUES
-- 前端开发组下属小组
(29, 'React开发小组', NULL, 20, 'REACT', 5, 5, '', '', '010-77777711-1', '中关村大街1号A座501-1', 'React框架开发', 1, 1, 0, 'default', 1),
(30, 'Vue开发小组', NULL, 20, 'VUE', 5, 5, '', '', '010-77777711-2', '中关村大街1号A座501-2', 'Vue框架开发', 2, 1, 0, 'default', 1),
-- 后端开发组下属小组
(31, 'Java开发小组', NULL, 21, 'JAVA', 5, 5, '', '', '010-77777712-1', '中关村大街1号A座502-1', 'Java后端开发', 1, 1, 0, 'default', 1),
(32, 'Python开发小组', NULL, 21, 'PYTHON', 5, 5, '', '', '010-77777712-2', '中关村大街1号A座502-2', 'Python后端开发', 2, 1, 0, 'default', 1),
-- 移动开发组下属小组
(33, 'iOS开发小组', NULL, 22, 'IOS', 5, 5, '', '', '010-77777713-1', '中关村大街1号A座503-1', 'iOS应用开发', 1, 1, 0, 'default', 1),
(34, 'Android开发小组', NULL, 22, 'ANDROID', 5, 5, '', '', '010-77777713-2', '中关村大街1号A座503-2', 'Android应用开发', 2, 1, 0, 'default', 1);

-- 6级部门 - 功能小分队
INSERT INTO `department` (`id`, `name`, `director_id`, `parent_id`, `dep_no`, `grade_id`, `is_level`, `fiiale`, `filialemark`, `tel`, `address`, `description`, `sort_order`, `status`, `delflag`, `tenant_id`, `created_by`) VALUES
-- React开发小组下属分队
(35, 'React UI分队', NULL, 29, 'REACTUI', 6, 6, '', '', '010-77777711-1-1', '中关村大街1号A座501-1-A', 'React界面开发', 1, 1, 0, 'default', 1),
(36, 'React业务分队', NULL, 29, 'REACTBIZ', 6, 6, '', '', '010-77777711-1-2', '中关村大街1号A座501-1-B', 'React业务逻辑', 2, 1, 0, 'default', 1),
-- Java开发小组下属分队
(37, 'Spring分队', NULL, 31, 'SPRING', 6, 6, '', '', '010-77777712-1-1', '中关村大街1号A座502-1-A', 'Spring框架开发', 1, 1, 0, 'default', 1),
(38, '微服务分队', NULL, 31, 'MICROSERVICE', 6, 6, '', '', '010-77777712-1-2', '中关村大街1号A座502-1-B', '微服务架构', 2, 1, 0, 'default', 1);

-- 7级部门 - 任务小组
INSERT INTO `department` (`id`, `name`, `director_id`, `parent_id`, `dep_no`, `grade_id`, `is_level`, `fiiale`, `filialemark`, `tel`, `address`, `description`, `sort_order`, `status`, `delflag`, `tenant_id`, `created_by`) VALUES
-- React UI分队下属任务组
(39, 'React组件任务组', NULL, 35, 'REACTCOMP', 7, 7, '', '', '010-77777711-1-1-1', '中关村大街1号A座501-1-A-1', 'React组件开发', 1, 1, 0, 'default', 1),
(40, 'React样式任务组', NULL, 35, 'REACTCSS', 7, 7, '', '', '010-77777711-1-1-2', '中关村大街1号A座501-1-A-2', 'React样式设计', 2, 1, 0, 'default', 1),
-- Spring分队下属任务组
(41, 'Spring Boot任务组', NULL, 37, 'SPRINGBOOT', 7, 7, '', '', '010-77777712-1-1-1', '中关村大街1号A座502-1-A-1', 'Spring Boot开发', 1, 1, 0, 'default', 1),
(42, 'Spring Cloud任务组', NULL, 37, 'SPRINGCLOUD', 7, 7, '', '', '010-77777712-1-1-2', '中关村大街1号A座502-1-A-2', 'Spring Cloud开发', 2, 1, 0, 'default', 1);

-- 半级部门示例（用*标识）
INSERT INTO `department` (`id`, `name`, `director_id`, `parent_id`, `dep_no`, `grade_id`, `is_level`, `fiiale`, `filialemark`, `tel`, `address`, `description`, `sort_order`, `status`, `delflag`, `tenant_id`, `created_by`) VALUES
(43, '项目管理*', NULL, 15, 'XMGL', 3, 1, '', '', '010-77777704', '中关村大街1号A座8层', '项目统筹管理', 4, 1, 0, 'default', 1),
(44, '质量保证*', NULL, 17, 'ZLBZ', 4, 1, '', '', '010-77777733', '中关村大街1号A座703', '质量管控', 3, 1, 0, 'default', 1);

-- ===================================================================
-- 2. 示例租户(demo-tenant)的组织架构数据
-- ===================================================================

-- 1级部门 - 公司总部
INSERT INTO `department` (`id`, `name`, `director_id`, `parent_id`, `dep_no`, `grade_id`, `is_level`, `fiiale`, `filialemark`, `tel`, `address`, `description`, `sort_order`, `status`, `delflag`, `tenant_id`, `created_by`) VALUES
(100, '创新科技有限公司', NULL, 0, 'CXKJ001', 1, 1, '1', 'HQ', '021-88888888', '上海市张江高科技园区', '公司总部', 1, 1, 0, 'demo-tenant', 1);

-- 2级部门 - 主要部门
INSERT INTO `department` (`id`, `name`, `director_id`, `parent_id`, `dep_no`, `grade_id`, `is_level`, `fiiale`, `filialemark`, `tel`, `address`, `description`, `sort_order`, `status`, `delflag`, `tenant_id`, `created_by`) VALUES
(101, '研发中心', NULL, 100, 'RD001', 2, 2, '', '', '021-88888801', '上海市张江高科技园区A座', '产品研发中心', 1, 1, 0, 'demo-tenant', 1),
(102, '市场部', NULL, 100, 'MKT001', 2, 2, '', '', '021-88888802', '上海市张江高科技园区B座', '市场营销部门', 2, 1, 0, 'demo-tenant', 1),
(103, '运营部', NULL, 100, 'OPS001', 2, 2, '', '', '021-88888803', '上海市张江高科技园区C座', '运营管理部门', 3, 1, 0, 'demo-tenant', 1);

-- 3级部门 - 细分团队
INSERT INTO `department` (`id`, `name`, `director_id`, `parent_id`, `dep_no`, `grade_id`, `is_level`, `fiiale`, `filialemark`, `tel`, `address`, `description`, `sort_order`, `status`, `delflag`, `tenant_id`, `created_by`) VALUES
-- 研发中心下属部门
(104, '前端团队', NULL, 101, 'FE001', 3, 3, '', '', '021-88888811', '上海市张江高科技园区A座5层', '前端开发团队', 1, 1, 0, 'demo-tenant', 1),
(105, '后端团队', NULL, 101, 'BE001', 3, 3, '', '', '021-88888812', '上海市张江高科技园区A座6层', '后端开发团队', 2, 1, 0, 'demo-tenant', 1),
(106, '测试团队', NULL, 101, 'QA001', 3, 3, '', '', '021-88888813', '上海市张江高科技园区A座7层', '质量测试团队', 3, 1, 0, 'demo-tenant', 1),
-- 市场部下属部门
(107, '销售团队', NULL, 102, 'SALES001', 3, 3, '', '', '021-88888821', '上海市张江高科技园区B座5层', '销售业务团队', 1, 1, 0, 'demo-tenant', 1),
(108, '推广团队', NULL, 102, 'PROMO001', 3, 3, '', '', '021-88888822', '上海市张江高科技园区B座6层', '市场推广团队', 2, 1, 0, 'demo-tenant', 1),
-- 运营部下属部门
(109, '客服团队', NULL, 103, 'CS001', 3, 3, '', '', '021-88888831', '上海市张江高科技园区C座5层', '客户服务团队', 1, 1, 0, 'demo-tenant', 1),
(110, '运维团队', NULL, 103, 'DEVOPS001', 3, 3, '', '', '021-88888832', '上海市张江高科技园区C座6层', '系统运维团队', 2, 1, 0, 'demo-tenant', 1);

-- ===================================================================
-- 3. 部门等级配置数据
-- ===================================================================

INSERT INTO `department_grade` (`id`, `dg_num`, `dg_name`, `dg_desc`, `level_weight`, `can_manage_lower`, `tenant_id`) VALUES
(1, 1, '集团级', '集团总部级别，最高管理层', 10, 1, 'default'),
(2, 2, '公司级', '分公司或子公司级别', 9, 1, 'default'),
(3, 3, '部门级', '主要业务部门级别', 8, 1, 'default'),
(4, 4, '团队级', '专业团队或小组级别', 7, 1, 'default'),
(5, 5, '小组级', '具体工作小组级别', 6, 1, 'default'),
(6, 6, '分队级', '功能专项分队级别', 5, 1, 'default'),
(7, 7, '任务级', '临时任务组级别', 4, 1, 'default');

-- 为示例租户添加等级配置
INSERT INTO `department_grade` (`id`, `dg_num`, `dg_name`, `dg_desc`, `level_weight`, `can_manage_lower`, `tenant_id`) VALUES
(11, 1, '公司级', '公司总部级别', 10, 1, 'demo-tenant'),
(12, 2, '中心级', '业务中心级别', 9, 1, 'demo-tenant'),
(13, 3, '团队级', '专业团队级别', 8, 1, 'demo-tenant');

-- ===================================================================
-- 4. 数据验证查询
-- ===================================================================

-- 查询默认租户的部门结构
-- SELECT d.id, d.name, d.parent_id, d.grade_id, d.dep_no,
--        CASE WHEN d.is_level = 1 THEN CONCAT(d.name, ' *') ELSE d.name END as display_name,
--        p.name as parent_name
-- FROM department d
-- LEFT JOIN department p ON d.parent_id = p.id
-- WHERE d.tenant_id = 'default' AND d.delflag = 0
-- ORDER BY d.grade_id, d.sort_order;

-- 查询部门层级结构
-- WITH RECURSIVE dept_tree AS (
--     SELECT id, name, parent_id, grade_id, dep_no, 1 as level, CAST(name AS CHAR(1000)) as path
--     FROM department 
--     WHERE parent_id = 0 AND tenant_id = 'default' AND delflag = 0
--     
--     UNION ALL
--     
--     SELECT d.id, d.name, d.parent_id, d.grade_id, d.dep_no, dt.level + 1, CONCAT(dt.path, ' > ', d.name)
--     FROM department d
--     INNER JOIN dept_tree dt ON d.parent_id = dt.id
--     WHERE d.tenant_id = 'default' AND d.delflag = 0
-- )
-- SELECT * FROM dept_tree ORDER BY level, id;

-- 统计各级部门数量
-- SELECT dg.dg_name as '等级名称', COUNT(d.id) as '部门数量'
-- FROM department_grade dg
-- LEFT JOIN department d ON dg.dg_num = d.grade_id AND d.tenant_id = 'default' AND d.delflag = 0
-- WHERE dg.tenant_id = 'default'
-- GROUP BY dg.dg_num, dg.dg_name
-- ORDER BY dg.dg_num; 