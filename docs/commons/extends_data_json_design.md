# 字典表扩展字段设计
1. 扩展字段定义表 (sys_dict_extend_field)
   字段名	类型	约束	描述
   id	BIGINT	PK	主键ID
   category_id	BIGINT	FK NOT NULL	关联的字典类目ID
   field_code	VARCHAR(50)	NOT NULL	扩展字段编码（英文标识）
   field_name	VARCHAR(50)	NOT NULL	扩展字段显示名称
   field_type	VARCHAR(20)	NOT NULL	字段类型(string/number/date/boolean)
   default_value	VARCHAR(100)		默认值
   sort_order	INT	DEFAULT 0	排序序号
   required	TINYINT(1)	DEFAULT 0	是否必填(0=否,1=是)
2. JSON配置示例
   场景：为"项目阶段"添加扩展字段
   添加扩展字段定义（在管理界面操作）

    进度百分比（percent，数字类型）
    
    负责人角色（owner_role，字符串类型）
    
    是否关键节点（critical，布尔类型）

3. 扩展字段定义表 数据示例：

    sql
    INSERT INTO sys_dict_extend_field
    (category_id, field_code, field_name, field_type, default_value, required)
    VALUES
    (103, 'percent', '进度百分比', 'number', '0', 1),
    (103, 'owner_role', '负责人角色', 'string', NULL, 0),
    (103, 'critical', '关键节点', 'boolean', '0', 0);

4. 类目表冗余字段（系统自动更新）：

json
{
"extend_schema": [
{
"field_code": "percent",
"field_name": "进度百分比",
"field_type": "number",
"default_value": "0",
"required": true
},
{
"field_code": "owner_role",
"field_name": "负责人角色",
"field_type": "string"
},
{
"field_code": "critical",
"field_name": "关键节点",
"field_type": "boolean",
"default_value": "false"
}
]
}

5. 子项扩展数据维护界面
当您添加扩展字段后，在字典子项管理界面会动态生成如下表格：

子项名称	子项编码	进度百分比	负责人角色	关键节点	操作
需求分析	REQUIRE	[输入框]	[下拉框]	[开关]	保存
开发阶段	DEVELOP	[输入框]	[下拉框]	[开关]	保存
测试阶段	TEST	[输入框]	[下拉框]	[开关]	保存


6. 系统实现建议
类目扩展管理界面
添加/删除扩展字段的表单
字段类型选择器（文本/数字/日期/布尔）
必填项标记
默认值设置

7. 样例数据
-- 获取插入的类目ID（假设为1）
SET @project_phase_id = LAST_INSERT_ID();

-- 2. 添加项目阶段扩展字段定义
INSERT INTO sys_dict_extend_field
(category_id, field_code, field_name, field_type, default_value, required)
VALUES
(@project_phase_id, 'percent', '进度百分比', 'number', '0', 1),
(@project_phase_id, 'owner_role', '负责人角色', 'string', NULL, 0);

-- 3. 添加项目阶段子项
INSERT INTO sys_dict_item
(category_id, item_code, item_name, sort_order, is_default, extend_data)
VALUES
(@project_phase_id, 'REQUIRE', '需求分析', 1, 1, '{"percent": 30, "owner_role": "产品经理"}'),
(@project_phase_id, 'DESIGN', '设计阶段', 2, 0, '{"percent": 50, "owner_role": "架构师"}'),
(@project_phase_id, 'DEVELOP', '开发阶段', 3, 0, '{"percent": 80, "owner_role": "开发工程师"}'),
(@project_phase_id, 'TEST', '测试阶段', 4, 0, '{"percent": 95, "owner_role": "测试工程师"}'),
(@project_phase_id, 'DEPLOY', '部署上线', 5, 0, '{"percent": 100, "owner_role": "运维工程师"}');

-- 4. 添加另一个类目：优先级
INSERT INTO sys_dict_category
(name, code, description)
VALUES
('优先级', 'PRIORITY', '任务优先级分类');

-- 获取插入的类目ID（假设为2）
SET @priority_id = LAST_INSERT_ID();

-- 5. 添加优先级子项
INSERT INTO sys_dict_item
(category_id, item_code, item_name, sort_order, is_default, extend_data)
VALUES
(@priority_id, 'HIGH', '高', 1, 0, NULL),
(@priority_id, 'MEDIUM', '中', 2, 1, '{"color": "#ff9900"}'),
(@priority_id, 'LOW', '低', 3, 0, NULL);

-- ----------------------------
-- 查询样例数据
-- ----------------------------

-- 1. 查询所有类目
SELECT * FROM sys_dict_category;

-- 2. 查询项目阶段的所有扩展字段定义
SELECT * FROM sys_dict_extend_field WHERE category_id = @project_phase_id;

-- 3. 查询项目阶段的所有子项及其扩展数据
SELECT
i.item_code AS '阶段编码',
i.item_name AS '阶段名称',
i.sort_order AS '排序',
i.extend_data->>'$.percent' AS '进度百分比',
i.extend_data->>'$.owner_role' AS '负责人角色'
FROM sys_dict_item i
WHERE i.category_id = @project_phase_id
ORDER BY i.sort_order;

-- 4. 查询优先级子项
SELECT
item_code AS '优先级编码',
item_name AS '优先级名称',
CASE is_default WHEN 1 THEN '是' ELSE '否' END AS '默认'
FROM sys_dict_item
WHERE category_id = @priority_id
ORDER BY sort_order;
样例数据说明：
1. 项目阶段类目 (PROJECT_PHASE)
   阶段名称	编码	排序	进度百分比	负责人角色
   需求分析	REQUIRE	1	30	产品经理
   设计阶段	DESIGN	2	50	架构师
   开发阶段	DEVELOP	3	80	开发工程师
   测试阶段	TEST	4	95	测试工程师
   部署上线	DEPLOY	5	100	运维工程师
2. 优先级类目 (PRIORITY)
   优先级名称	编码	排序	是否默认
   高	HIGH	1	否
   中	MEDIUM	2	是
   低	LOW	3	否
   数据结构关系图：
 ```text
   ┌──────────────────┐       ┌──────────────────────┐       ┌──────────────────┐
   │ sys_dict_category│1───┐  │sys_dict_extend_field │       │  sys_dict_item   │
   ├──────────────────┤    │  ├──────────────────────┤       ├──────────────────┤
   │ id           (PK)│    └──┤ category_id      (FK)├───┐  │ id           (PK)│
   │ name             │       │ field_code           │   │  │ category_id  (FK)├──┐
   │ code             │       │ field_name           │   │  │ item_code        │  │
   │ description      │       └──────────────────────┘   │  │ ...              │  │
   │ extend_schema    │                                  │  └──────────────────┘  │
   └──────────────────┘                                  └────────────────────────┘
   │                                                  │           ▲
   │                                                  │           │
   └──────────────────────────────────────────────────┘           │
   │
   ┌──────────────────────┐                                      │
   │ extend_data 字段内容 │                                      │
   ├──────────────────────┤                                      │
   │ {                    │                                      │
   │   "percent": 30,     │                                      │
   │   "owner_role": ".." │                                      │
   │ }                    │                                      │
   └──────────────────────┘                                      │
   │
   ┌──────────────────────┐                                      │
   │ extend_schema 字段   │                                      │
   ├──────────────────────┤                                      │
   │ [ {                 │                                      │
   │   "field_code":...   │                                      │
   │ } ]                 │                                      │
   └──────────────────────┘                                      │
   │
   ┌──────────────────────┐                                      │
   │ sys_dict_extend_field│                                      │
   │ 存储扩展字段定义      │──────────────────────────────────────┘
   └──────────────────────┘
   ```

   查询结果示例：
   项目阶段查询结果：

text
+--------------+--------------+--------+--------------+-----------------+
| 阶段编码     | 阶段名称     | 排序   | 进度百分比   | 负责人角色      |
+--------------+--------------+--------+--------------+-----------------+
| REQUIRE      | 需求分析     | 1      | 30           | 产品经理        |
| DESIGN       | 设计阶段     | 2      | 50           | 架构师          |
| DEVELOP      | 开发阶段     | 3      | 80           | 开发工程师      |
| TEST         | 测试阶段     | 4      | 95           | 测试工程师      |
| DEPLOY       | 部署上线     | 5      | 100          | 运维工程师      |
+--------------+--------------+--------+--------------+-----------------+
优先级查询结果：

text
+-----------------+-----------------+----------+
| 优先级编码      | 优先级名称      | 默认     |
+-----------------+-----------------+----------+
| HIGH            | 高              | 否       |
| MEDIUM          | 中              | 是       |
| LOW             | 低              | 否       |
+-----------------+-----------------+----------+
系统使用流程：
创建类目：先创建字典类目（如项目阶段）

定义扩展字段：为该类目添加需要的扩展字段（如进度百分比）

添加子项：添加具体的字典项，并设置扩展字段的值

查询使用：

sql
-- 获取项目阶段的所有选项
SELECT item_code, item_name
FROM sys_dict_item
WHERE category_id = (SELECT id FROM sys_dict_category WHERE code = 'PROJECT_PHASE')
ORDER BY sort_order;

-- 获取带扩展字段的数据
SELECT
item_code,
item_name,
extend_data->>'$.percent' AS progress
FROM sys_dict_item
WHERE category_id = (SELECT id FROM sys_dict_category WHERE code = 'PROJECT_PHASE');
这个样例展示了完整的字典系统实现，包含：

基本字典管理（类目+子项）

动态扩展字段定义

扩展数据的存储和查询

多字典类目的支持