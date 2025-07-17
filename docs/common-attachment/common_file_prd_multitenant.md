# 通用附件管理功能 PRD（多租户版）

## 一、背景与目标

在多业务系统和多租户SaaS平台中，附件（如图片、文档、音视频等）管理是高频需求。为避免重复开发、提升维护效率、增强安全性和扩展性，需设计一套支持多租户的通用附件管理模块，支持多业务场景的统一接入和灵活扩展。

## 二、核心需求

### 1. 多租户支持
- 附件、附件关联、元数据等所有核心表均需增加 `tenant_id` 字段，确保数据隔离。
- 所有接口、查询、操作均需基于当前租户上下文进行权限校验和数据过滤。
- 支持租户级别的存储策略、容量配额、访问控制等扩展。

### 2. 附件存储与管理
- 设计独立的附件主表，统一存储所有业务附件的元数据。
- 支持多种存储方式（本地、云存储如OSS/COS/S3等），可灵活切换。
- 支持附件与任意业务表的灵活关联（通过业务类型+业务ID或关联表）。
- 支持附件的元数据扩展（如自定义标签、描述、排序、是否封面等）。

### 3. 上传与下载
- 支持多文件上传、断点续传、大文件分片上传。
- 支持上传进度显示、文件类型/大小限制、拖拽/粘贴上传。
- 上传后返回附件ID、URL、原始文件名等信息。
- 支持附件的安全下载、临时授权访问（如签名URL、STS等）。

### 4. 关联与解绑
- 支持附件与业务数据的绑定、解绑操作。
- 支持批量绑定/解绑。
- 支持未绑定附件的定期清理。

### 5. 查询与预览
- 支持按业务类型、业务ID查询附件列表。
- 支持图片、PDF、Office文档等常见格式的在线预览。
- 支持附件的排序、筛选、分页。

### 6. 删除与回收
- 支持逻辑删除与物理删除两种策略，默认逻辑删除。
- 支持回收站、定期清理物理文件。
- 删除操作需校验权限。

### 7. 权限与安全
- 支持基于用户/角色/业务/租户的访问控制。
- 上传阶段进行文件类型白名单校验、病毒扫描。
- 支持操作日志审计，记录所有上传、下载、删除等敏感操作。

### 8. 性能与扩展
- 支持高并发上传/下载，单文件上传<500ms（10MB内）。
- 支持TB级别存储扩展，日均百万次访问。
- 支持CDN加速、热点附件缓存（如Redis）。

## 三、数据结构设计（多租户）

### 1. 附件主表（attachment）

| 字段名         | 类型         | 说明             |
| -------------- | ------------ | ---------------- |
| id             | BIGINT       | 主键             |
| tenant_id      | BIGINT       | 租户ID           |
| original_name  | VARCHAR(255) | 原始文件名       |
| file_key       | VARCHAR(100) | 存储唯一标识(UUID)|
| file_type      | VARCHAR(50)  | MIME类型         |
| file_size      | BIGINT       | 字节数           |
| storage_type   | VARCHAR(20)  | OSS/LOCAL/S3等   |
| md5            | CHAR(32)     | 文件摘要         |
| upload_time    | DATETIME     | 上传时间         |
| upload_user_id | BIGINT       | 上传用户ID       |
| sort_order     | INT          | 排序字段，用户自定义显示顺序 |
| is_deleted     | TINYINT      | 逻辑删除标记     |

#### SQL 示例：
```sql
CREATE TABLE common_attachment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_key VARCHAR(100) NOT NULL UNIQUE,
    file_type VARCHAR(50),
    file_size BIGINT,
    storage_type VARCHAR(20),
    md5 CHAR(32),
    upload_time DATETIME NOT NULL,
    upload_user_id BIGINT,
    sort_order INT DEFAULT 0 COMMENT '排序字段，用户自定义显示顺序',
    is_deleted TINYINT DEFAULT 0,
    INDEX idx_tenant (tenant_id)
);
```

### 2. 附件关联表（common_attachment_rel）

| 字段名        | 类型         | 说明             |
| ------------- | ------------ | ---------------- |
| id            | BIGINT       | 主键             |
| tenant_id     | BIGINT       | 租户ID           |
| biz_id        | BIGINT       | 业务主键         |
| biz_type      | VARCHAR(50)  | 业务类型         |
| attachment_id | BIGINT       | 附件ID           |
| sort_order    | INT          | 排序字段         |

#### SQL 示例：
```sql
CREATE TABLE attachment_rel (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NOT NULL,
    biz_id BIGINT NOT NULL,
    biz_type VARCHAR(50) NOT NULL,
    attachment_id BIGINT NOT NULL,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (attachment_id) REFERENCES attachment(id),
    INDEX idx_tenant_biz (tenant_id, biz_type, biz_id)
);
```

### 3. 附件元数据表（common_attachment_meta）（可选）

| 字段名        | 类型         | 说明             |
| ------------- | ------------ | ---------------- |
| tenant_id     | BIGINT       | 租户ID           |
| attachment_id | BIGINT       | 附件ID           |
| meta_key      | VARCHAR(50)  | 元数据键         |
| meta_value    | VARCHAR(200) | 元数据值         |

#### SQL 示例：
```sql
CREATE TABLE common_attachment_meta (
    tenant_id BIGINT NOT NULL,
    attachment_id BIGINT NOT NULL,
    meta_key VARCHAR(50) NOT NULL,
    meta_value VARCHAR(200),
    PRIMARY KEY (tenant_id, attachment_id, meta_key)
);
```
二、common_attachment_meta 表设计逻辑说明
1. 设计目的
common_attachment_meta 作为附件的“扩展属性表”，用于存储不定项、可扩展的元数据（Meta Data），如标签、分类、是否封面、业务自定义属性等。
解决主表字段固定、难以灵活扩展的问题，支持不同业务对附件的多样化需求。
2. 结构特点
以 (tenant_id, attachment_id, meta_key) 作为联合主键，确保同一附件、同一租户下的某个元数据键唯一。
meta_key 为属性名（如 is_cover、category、tag、description 等），meta_value 为属性值（如 true、合同、发票等）。
支持任意扩展，不影响主表结构和历史数据。
3. 典型应用场景
标记某个附件为“封面图”：meta_key = 'is_cover', meta_value = 'true'
附件分类：meta_key = 'category', meta_value = '合同'
业务自定义标签：meta_key = 'tag', meta_value = '重要'
记录上传来源、用途、备注等
4. 优势
灵活扩展：无需频繁修改主表结构即可支持新属性。
兼容多业务：不同业务可自定义所需的元数据。
数据隔离：每个租户、每个附件的元数据独立存储，安全可靠。


## 四、接口设计（多租户）

所有接口需在请求上下文中传递租户ID（如Header、Token、Session等），后端需严格校验。

### 1. 上传附件
- `POST /api/attachment/upload`
  - 参数：文件（支持多文件）、业务类型（可选）、业务ID（可选）、租户ID（隐式/显式）
  - 返回：附件信息列表（ID、URL、原始名等）

### 2. 绑定附件
- `POST /api/attachment/bind`
  - 参数：附件ID、业务类型、业务ID、租户ID
  - 返回：操作结果

### 3. 查询附件列表
- `GET /api/attachment/list?bizType=xxx&bizId=xxx`
  - 参数：租户ID（隐式/显式）
  - 返回：附件列表（支持分页、排序）

### 4. 删除附件
- `DELETE /api/attachment/{id}`
  - 参数：附件ID、租户ID
  - 返回：操作结果（逻辑删除）

### 5. 预览/下载附件
- `GET /api/attachment/preview/{id}`
- `GET /api/attachment/download/{id}`
  - 均需校验租户ID

### 6. 解绑附件
- `POST /api/attachment/unbind`
  - 参数：附件ID、业务类型、业务ID、租户ID

### 7. 附件元数据维护（可选）
- `POST /api/attachment/meta`
  - 参数：附件ID、meta_key、meta_value、租户ID

## 五、权限与安全设计

- 所有操作均需校验租户ID，防止越权访问。
- 支持租户级别的容量配额、存储策略、访问控制。
- 上传、删除、下载等操作需鉴权，支持细粒度权限控制。
- 上传文件类型、大小校验，集成病毒扫描。
- 访问私有附件需临时授权（如签名URL）。
- 所有操作记录审计日志，支持敏感操作二次验证。

## 六、实施建议与阶段目标

1. **第一阶段**：实现基础上传、OSS存储、附件与业务绑定、基本查询与删除，支持多租户隔离。
2. **第二阶段**：完善权限控制、日志审计、回收站、定期清理、租户配额。
3. **第三阶段**：支持分片上传、断点续传、元数据扩展、CDN加速、租户级存储策略。
4. **第四阶段**：多存储引擎支持、存储迁移工具、性能优化。

## 七、验收标准

- 支持多业务模块和多租户统一接入，接口文档完善。
- 上传、绑定、查询、删除、预览等功能完整，权限控制有效，租户数据隔离。
- 支持高并发、海量存储，性能达标。
- 安全防护措施到位，日志审计可追溯。 



## 框架审计字段
  `delflag` tinyint(1) NULL DEFAULT 0 COMMENT '删除标识',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'default' COMMENT '租户ID',
  `created_by` bigint(20) NULL DEFAULT NULL COMMENT '创建人',
  `updated_by` bigint(20) NULL DEFAULT NULL COMMENT '更新人',


## 框架通用

 - id字段生成逻辑是通过雪花算法生成的的唯一长整型数字，前后端调用时注意精度丢失，这里复用下organization-servic下id的转换逻辑
 - 统一使用公共的返回对象，普通返回就用Result，分页查询就用pageResult
返回结果对象 zlt-commons/zlt-common-core/src/main/java/com/central/common/model/Result.java
分页返回结果 @zlt-commons/zlt-common-core/src/main/java/com/central/common/model/PageResult.java
同时PageResult类中请用resp_code作为响应的错误码
 - 跨服务之间调用使用feign 参考样例 @zlt-commons/zlt-common-core/src/main/java/com/central/common/feign/OrganizationService.java
 - 获取用-户信息 SysUser user = LoginUserUtils.getCurrentSysUser()
 - 获取当前登录的租户 String tenantId = TenantContextHolder.getTenant();
 - 表的枚举类只能用英文，备注用中英文解释
