# 扩展字段扩充设计

扩展字段的核心需求
类目级扩展：扩展字段应该在类目级别定义，同一类目的所有子项共享相同的扩展字段

批量维护：添加扩展字段后，所有子项应能在一个界面统一维护该字段的值

动态扩展：无需修改表结构即可增加新属性

类型支持：支持不同数据类型的扩展字段

优化后的设计方案
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
2. 字典类目表 (sys_dict_category) - 新增字段
   sql
   ALTER TABLE sys_dict_category
   ADD COLUMN extend_schema JSON COMMENT '扩展字段JSON结构（冗余字段，优化查询）';
3. 字典子项表 (sys_dict_item) - 保持不变
   sql
   extend_data JSON COMMENT '扩展字段值，格式：{"字段编码":"值"}'
   JSON配置示例
   场景：为"项目阶段"添加扩展字段
   添加扩展字段定义（在管理界面操作）

进度百分比（percent，数字类型）

负责人角色（owner_role，字符串类型）

是否关键节点（critical，布尔类型）

扩展字段定义表 数据示例：

sql
INSERT INTO sys_dict_extend_field
(category_id, field_code, field_name, field_type, default_value, required)
VALUES
(103, 'percent', '进度百分比', 'number', '0', 1),
(103, 'owner_role', '负责人角色', 'string', NULL, 0),
(103, 'critical', '关键节点', 'boolean', '0', 0);
类目表冗余字段（系统自动更新）：

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
子项扩展数据维护界面
当您添加扩展字段后，在字典子项管理界面会动态生成如下表格：

子项名称	子项编码	进度百分比	负责人角色	关键节点	操作
需求分析	REQUIRE	[输入框]	[下拉框]	[开关]	保存
开发阶段	DEVELOP	[输入框]	[下拉框]	[开关]	保存
测试阶段	TEST	[输入框]	[下拉框]	[开关]	保存
子项数据存储示例
sql
-- 需求分析阶段
UPDATE sys_dict_item SET extend_data = '{
"percent": 30,
"owner_role": "产品经理",
"critical": true
}' WHERE id = 201;

-- 开发阶段
UPDATE sys_dict_item SET extend_data = '{
"percent": 65,
"owner_role": "技术负责人"
}' WHERE id = 202;
查询使用示例
sql
-- 获取所有项目阶段及其扩展字段
SELECT
i.item_name,
i.item_code,
i.extend_data->>'$.percent' AS progress_percent,
i.extend_data->>'$.owner_role' AS owner_role,
i.extend_data->>'$.critical' AS is_critical
FROM sys_dict_item i
JOIN sys_dict_category c ON c.id = i.category_id
WHERE c.code = 'PROJECT_PHASE';
系统实现建议
类目扩展管理界面

添加/删除扩展字段的表单

字段类型选择器（文本/数字/日期/布尔）

必填项标记

默认值设置

批量维护功能

javascript
// 伪代码：保存所有子项的扩展字段
function saveAllExtensions(categoryId) {
const extensions = getExtensionsForCategory(categoryId);
const items = getItemsByCategory(categoryId);

items.forEach(item => {
const data = {};
extensions.forEach(ext => {
data[ext.field_code] = getInputValue(item.id, ext.field_code);
});
saveItemExtensions(item.id, data);
});
}
数据校验逻辑

java
// Java 伪代码：扩展字段校验
public void validateExtensions(JSONObject data, JSONArray schema) {
for (FieldSchema field : schema) {
if (field.isRequired() && !data.has(field.getCode())) {
throw new ValidationException(field.getName() + "为必填字段");
}

    if (data.has(field.getCode())) {
      Object value = data.get(field.getCode());
      switch (field.getType()) {
        case "number":
          if (!(value instanceof Number)) {
            throw new ValidationException(field.getName() + "需为数字");
          }
          break;
        case "boolean":
          if (!(value instanceof Boolean)) {
            throw new ValidationException(field.getName() + "需为布尔值");
          }
          break;
      }
    }
}
}
优势总结
动态扩展：无需修改数据库表结构即可添加新字段

批量维护：同一类目的所有子项共享字段定义，可统一维护

类型安全：支持多种数据类型和校验规则

查询优化：类目表冗余schema信息避免联表查询

界面友好：动态生成表单控件，提升配置效率

这种设计完全满足您描述的"在类目添加扩展字段，所有子项自动获得该字段，并能在统一界面维护"的需求，同时保持系统的灵活性和可维护性。