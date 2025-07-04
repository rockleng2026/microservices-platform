# 需求分析与完善（PRD）

## 一、背景与目标
在企业级系统中，枚举/字典类数据（如职位等级、性别、项目阶段等）广泛存在。为避免硬编码、提升灵活性和可维护性，需设计一套通用字典表模型，实现所有枚举类的统一管理、动态扩展和高效调用。

## 二、核心需求
- **通用性**：支持所有业务枚举/字典类型（如性别、职位等级、项目类别等）。
- **灵活性**：无需修改代码即可动态增删字典项，支持扩展自定义字段。
- **唯一性与数据一致性**：类目编码全局唯一，明细项在类目内唯一。
- **状态管理**：支持启用/禁用，便于灰度发布和数据隔离。
- **排序与默认值**：支持自定义排序，支持标记默认项。
- **扩展性**：支持JSON扩展字段，便于存储如颜色、图标、国际化等。
- **审计与安全**：包含创建/更新人及时间，支持多租户隔离（如有需要）。
- **高性能**：支持缓存、批量查询、按code快速定位。
- **API友好**：提供标准RESTful接口，便于前后端解耦。
- **国际化**：如有多语言需求，支持多语言扩展表。

## 三、表结构设计（SQL）

### 1. 字典类目表（sys_dict_category）
```sql
CREATE TABLE sys_dict_category (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  name VARCHAR(50) NOT NULL COMMENT '类目名称',
  code VARCHAR(50) NOT NULL UNIQUE COMMENT '类目编码（英文唯一标识）',
  description VARCHAR(255) COMMENT '描述信息',
  status TINYINT DEFAULT 1 COMMENT '状态（0=禁用, 1=启用）',
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  created_by bigint(20) NULL DEFAULT NULL COMMENT '创建人',
  updated_by bigint(20) NULL DEFAULT NULL COMMENT '更新人'  
) COMMENT='字典类目表';
```
### 2. 字典扩展字段定义表（sys_dict_extend_field）
```sql
CREATE TABLE sys_dict_extend_field (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  category_id BIGINT NOT NULL COMMENT '关联的字典类目ID',
  field_code VARCHAR(50) NOT NULL COMMENT '扩展字段编码（英文标识，同一类目下唯一）',
  field_name VARCHAR(50) NOT NULL COMMENT '扩展字段显示名称',
  field_type VARCHAR(20) NOT NULL COMMENT '字段类型(string/number/date/boolean)',
  default_value VARCHAR(100) COMMENT '默认值',
  sort_order INT DEFAULT 0 COMMENT '排序序号',
  extend_schema json DEFAULT NULL COMMENT '扩展字段JSON结构（冗余字段，优化查询）',
  required TINYINT(1) DEFAULT 0 COMMENT '是否必填(0=否,1=是)',
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  created_by bigint(20) NULL DEFAULT NULL COMMENT '创建人',
  updated_by bigint(20) NULL DEFAULT NULL COMMENT '更新人',
  
  -- 外键约束（确保关联有效的字典类目）
  FOREIGN KEY (category_id) 
    REFERENCES sys_dict_category(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
    
  -- 同一类目下字段编码唯一约束
  UNIQUE KEY uk_category_field (category_id, field_code),
  
  -- 字段类型校验约束
  CONSTRAINT chk_field_type CHECK (
    field_type IN ('string', 'number', 'date', 'boolean')
  )
) COMMENT '字典扩展字段定义表';

-- 添加索引优化查询性能
CREATE INDEX idx_category_id ON sys_dict_extend_field(category_id);
CREATE INDEX idx_field_code ON sys_dict_extend_field(field_code);

```
### 3. 字典明细表（sys_dict_item）
```sql
CREATE TABLE sys_dict_item (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  category_id BIGINT NOT NULL COMMENT '关联类目ID',
  item_code VARCHAR(50) NOT NULL COMMENT '子项编码（如：MALE/FEMALE）',
  item_name VARCHAR(100) NOT NULL COMMENT '子项名称（如：男/女）',
  sort_order INT DEFAULT 0 COMMENT '排序序号',
  extend_data JSON COMMENT '扩展字段值，格式：{"字段编码":"值"}',
  is_default TINYINT(1) DEFAULT 0 COMMENT '是否默认项（0=否, 1=是）',
  status TINYINT DEFAULT 1 COMMENT '状态（0=禁用, 1=启用）',
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  created_by bigint(20) NULL DEFAULT NULL COMMENT '创建人',
  updated_by bigint(20) NULL DEFAULT NULL COMMENT '更新人',
  FOREIGN KEY (category_id) REFERENCES sys_dict_category(id) ON DELETE CASCADE,
  UNIQUE KEY uk_category_item (category_id, item_code)
) COMMENT='字典明细表';
```

### 3. 多语言扩展表（如有国际化需求，可选）
```sql
CREATE TABLE sys_dict_item_i18n (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  item_id BIGINT NOT NULL COMMENT '字典明细ID',
  lang VARCHAR(10) NOT NULL COMMENT '语言代码（如zh-CN、en-US）',
  item_name_i18n VARCHAR(100) NOT NULL COMMENT '多语言名称',
  UNIQUE KEY uk_item_lang (item_id, lang),
  FOREIGN KEY (item_id) REFERENCES sys_dict_item(id) ON DELETE CASCADE
) COMMENT='字典明细多语言表';
```

## 四、接口设计建议（API）
- `GET /api/dict/categories` 获取所有字典类目
- `POST /api/dict/category` 新增字典类目
- `PUT /api/dict/category/{id}` 编辑字典类目
- `DELETE /api/dict/category/{id}` 删除字典类目
- `GET /api/dict/items?categoryCode=GENDER` 获取某类目下所有明细项
- `POST /api/dict/item` 新增字典明细
- `PUT /api/dict/item/{id}` 编辑字典明细
- `DELETE /api/dict/item/{id}` 删除字典明细

## 五、使用与扩展说明
- **缓存建议**：建议对字典数据做本地缓存，减少数据库压力，提升性能。
- **多租户支持**：如有多租户需求，建议在表结构中增加`tenant_id`字段，并做隔离。
- **ID精度**：前后端交互时，ID字段建议统一用字符串，避免JS精度丢失。
- **数据引用**：业务表引用字典项时，建议用`category_code`+`item_code`，避免硬编码ID。
- **批量导入导出**：支持Excel/CSV批量导入导出，便于运维。
- **扩展设计**: 
  extend_data JSON字段：存储自定义属性（如颜色值、图标等）  
  is_default 标记默认选项，便于表单预选


## 六、典型用例

### 配置性别字典
```sql
INSERT INTO sys_dict_category (name, code, description) VALUES ('性别', 'GENDER', '性别分类');
INSERT INTO sys_dict_item (category_id, item_code, item_name, sort_order, is_default)
  VALUES (101, 'MALE', '男', 1, 1), (101, 'FEMALE', '女', 2, 0), (101, 'UNKNOWN', '未知', 3, 0);
```

### 查询用法
```sql
SELECT item_code AS `key`, item_name AS value
FROM sys_dict_item
WHERE category_id = (SELECT id FROM sys_dict_category WHERE code = 'GENDER') AND status = 1
ORDER BY sort_order;
```

## 七、系统优势总结
- 通用性强，支持所有枚举/字典类型
- 动态配置，灵活扩展
- 维护便捷，避免硬编码
- 支持多语言、缓存、高性能
- 适配多租户、审计、权限等企业级需求


扩展字段的核心需求
类目级扩展：扩展字段应该在类目级别定义，同一类目的所有子项共享相同的扩展字段

批量维护：添加扩展字段后，所有子项应能在一个界面统一维护该字段的值

动态扩展：无需修改表结构即可增加新属性

类型支持：支持不同数据类型的扩展字段
