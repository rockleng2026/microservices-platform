# 多维表格设计
超越了传统Excel表格的功能，融合了数据库、可视化看板、自动化流程等多种能力


多维表格具有五大核心模块：升级的数据库、全新仪表盘、权限管理、工作流和多维表格AI

将AI能力封装进表格列的创新设计，用户无需编写复杂提示词就能批量处理数据

多维表格的底层架构支持单表百万行数据处理，采用"热行"概念承载动态计算

多维表格通过统一底层架构解决企业自建系统数据孤岛问题

合同管理模块的完整搭建过程，体现了其基于关系型数据库的设计理念


## 多维表格应用场景
### 项目管理

![alt text](image.png)

### 合同管理

#### 业务述求
建立合同档案：将线下合同电子化，方便随时查阅；
回款跟进：当合同还有剩余回款时，提醒负责人跟进客户付款；
合同到期提醒：合同到期前对相关的负责人进行提醒，跟进客户进行续约；
数据统计：以可视化的方式呈现合同的各项数据，如签订客户数量、金额、趋势、已回款占比等等，方便管理者了解业绩和部署工作。

#### 合同业务对象

根据上面的需求，我们可以得到合同业务涉及的业务对象如下：
. 合同：主要业务对象，且包括产品明细和回款记录两项明细数据；
. 客户：签约的客户信息；
. 产品：合同中包含的产品（或服务）信息；
. 责任人：负责跟进合同的人员，以便进行提醒。

参考url
https://www.woshipm.com/pd/5793100.html

设计思路 万物即可创建对象
你导入一个用户表格的数据就可以创建一个对象

新建一个表格(对象) 第一列/第二列/第三列/自定义名称 --一个表格就是一个对象 一列就是一个属性字段
一个表格的某列可以关联到某个表格的某个字段

比如文章提到的 先创建了一个省份的表格，后面创建了一个客户的表格，客户表格中有个字段关联到了省份表格的省份名词字段
![alt text](image-1.png)


#### 合同到期提醒功能
合同到期需求提醒这个比较简单，我们可以设置合同结束日期前30天提醒负责人跟进。同时为了方便负责人知道是哪一份合同，我们可以在第2步设置为查找记录，将合同的信息列出来。然后第3步增加一个查看详情的按钮，查看第2步对应的记录信息，设置的流程如下
第一步 配置触发条件 到达记录时间时，选择某个表格的时间列，设置触发时间(设置条件)
第二步 查找记录 选择合同表的 然后选数据(第一步被触发的记录) 设置查找的内容
第三步 发送消息(个人/群组) 配置接收人/群组 标题  内容 还可以添加浏览链接按钮，标题，配置链接地址(内容为第二步查找的记录），显示视图(选择承载数据的表格)


#### 数据可视化看板



deepseek分析

嗯，用户想了解飞书多维表格的功能和实现原理。这是一个关于企业协作软件的技术问题，需要我从产品功能和技术架构两个维度进行专业解析。

我看到了很多搜索结果，其中包含了丰富的相关信息。从1和3中可以看出，飞书多维表格是飞书推出的一个创新性功能，它超越了传统Excel表格的功能，融合了数据库、可视化看板、自动化流程等多种能力。

关于功能方面，5提到多维表格具有五大核心模块：升级的数据库、全新仪表盘、权限管理、工作流和多维表格AI。1详细介绍了其"AI字段捷径"功能，这是将AI能力封装进表格列的创新设计，用户无需编写复杂提示词就能批量处理数据。

在实现原理上，3提到多维表格的底层架构支持单表百万行数据处理，采用"热行"概念承载动态计算值。610则从业务角度说明多维表格通过统一底层架构解决企业自建系统数据孤岛问题。

从技术实现看，24介绍了多维表格与DeepSeek-R1等大模型的深度集成，通过API实现批量AI处理能力。8展示了一个合同管理模块的完整搭建过程，体现了其基于关系型数据库的设计理念。

用户可能是企业IT管理者或数字化负责人，希望评估该工具的技术能力。也可能是业务人员想了解如何用它提升效率。需要我全面解析其功能架构和技术实现。

考虑设计回答分为功能架构和技术实现两大部分。功能部分会重点介绍数据管理、AI集成、自动化等核心能力；技术部分将解析其底层架构、扩展机制和安全设计。准备用表格对比传统工具与多维表格的区别，并在关键功能处添加emoji图标增强可读性。最后给出典型应用场景帮助用户理解实际价值。

飞书多维表格是飞书推出的创新型业务管理工具，深度融合了数据库、可视化看板、自动化流程与AI能力，实现了“一张表搭建一个系统”的业务数字化理念。以下从核心功能和实现原理两方面进行专业解析：

📊 一、核心功能
多维度数据管理

字段类型扩展：支持文本、数字、人员、公式、AI字段等20+字段类型，可自定义数据结构15。

关系型数据表：支持跨表关联（如客户-合同-产品），通过“查找引用”字段实现数据联动，构建完整业务对象模型8。

百万级数据承载：单表支持百万行“热行”（动态计算行），满足企业级数据量需求，计算性能较传统表格提升10倍56。

AI深度集成（AI字段捷径）

批量AI处理：通过封装大模型能力（如DeepSeek-R1、月之暗面等），用户添加一列即可实现：

文本总结/分类（如用户评论情感分析）14；

信息提取（合同关键字段、发票识别）17；

内容生成（商品视频脚本、客服回复）17。

多模型调度：支持硅基流动等平台API接入，自由切换模型处理不同任务24。

自动化与工作流

可视化流程画布：支持循环、条件分支等复杂逻辑，替代传统开发（如蔚来换电站项目自动化预警）56。

事件驱动：基于数据变更触发操作（如合同到期前30天自动提醒负责人）8。

高级可视化与权限

动态仪表盘：集成指标卡、雷达图、NPS图等组件，支持实时分析千万级跨表数据5。

细胞级权限：控制行、列、视图的读写权限，实现数据隔离（如蔚来48区域信息保密）56。

⚙️ 二、实现原理
底层架构

混合存储引擎：结合关系型数据库（管理结构化数据）与文档数据库（存储富文本附件），实现高效查询与扩展610。

计算层优化：

公式计算类似Excel但支持跨表引用（如自动汇总合同回款金额）8；

热行技术实时更新动态数据，减少重复计算5。

AI集成机制

字段捷径中心：

开发者可将AI能力封装为字段插件（如DeepSeek-R1批处理）；

用户通过自然语言指令调用，系统自动拼接字段数据生成完整Prompt24。

结果结构化：AI输出经二次处理（如标签归类）转为可分析数据47。

扩展性与集成

开放API：支持与金蝶、用友等外部系统对接，同步业务数据610。

插件生态：开发者可基于扣子平台发布字段捷径，企业自主开发巡检、排班等垂直场景插件17。

安全与性能保障

沙箱环境：AI任务在隔离环境执行，防止数据泄露2。

分布式计算：百万行数据分片处理，结合缓存策略提升响应速度56。

💼 三、典型场景与技术价值
场景	实现方案	效果
蔚来换电站管理	权限隔离+自动化预警+跨区域视图	节省2.16万工时，效率翻倍6
茶百道客户之声分析	AI字段自动打标+情感分析+回复生成	差评响应时效提升90%7
合同管理	关联数据表+公式计算+到期自动化提醒	回款跟踪效率提升80%8
💎 总结
飞书多维表格的本质是零代码业务操作系统，其技术核心在于：
✅ 结构化封装：将数据库、AI、自动化封装为简单字段操作，降低使用门槛；
✅ 可扩展架构：通过开放生态支持企业定制化需求；
✅ 实时协同引擎：解决大规模数据动态计算与权限管控难题。

其创新性在于融合了Excel的灵活性、数据库的强大性及AI的智能化，成为企业降本增效的“数字底座”，典型案例如蔚来、茶百道等已验证其业务价值6710。

我也想开发一个多维表格的系统，请以一个java系统架构师的身份给出一份设计方案，包括数据库表 和一份初始化的数据库脚本 方案格式严格按照markdown的标准格式生成
我们计划设计一个简化的多维表格系统，核心功能包括：

1. 支持多张表格（Table），每张表格包含多个字段（Column）和行（Row）

2. 字段支持多种类型（文本、数字、日期、人员等）

3. 支持跨表关联（查找引用字段）

4. 支持视图（View）定义，包括过滤、排序、分组等

5. 支持权限管理（表级、行级、列级）

6. 支持多租户需求

作为Java系统架构师，我们将采用以下技术栈：

- 后端：Spring Boot + MyBatis Plus（或JPA，这里选用MyBatis Plus更灵活）

- 数据库：MySQL（考虑到关系型数据模型）

- 缓存：Redis（用于权限缓存和部分数据缓存）

- 消息队列：RabbitMQ（用于异步处理，如公式计算、关联更新等）

系统模块划分：

1. 用户与权限模块

2. 表结构管理模块（包括字段管理）

3. 数据管理模块（行数据的增删改查）

4. 视图管理模块

5. 关联与引用模块（处理跨表关联）

6. 公式计算引擎（可选，先实现基础功能）

数据库设计：

1. 用户表（user）

2. 团队/组织表（team，可选，简化版可先不做）

3. 表格表（table）

4. 字段表（column）

5. 行表（row，每个表的数据独立存储，采用动态表？但动态表不利于关联查询，因此我们采用统一的行表，但每个字段值用JSON存储？或者使用EAV模型？）

考虑到多维表格的灵活性，我们采用以下方案：

- 每个表格的行数据存储在一张独立的物理表中？这样会导致表数量很多，且动态创建表，管理复杂。

- 或者使用一个统一的表来存储所有行数据，结构如下：

row_id, table_id, 然后使用一个JSON类型的字段存储该行的所有数据。这样查询效率较低，但简化了设计。

但是，考虑到关联查询和高效过滤，我们可能需要使用关系型结构。因此，我们采用混合模式：

1. 固定表：存储元数据（表、字段、视图等）

2. 动态表：每个表格创建时，动态生成一张数据表，表结构由字段定义决定。这样可以利用关系型数据库的索引和查询能力。

然而，动态创建表在管理和跨表查询时较为复杂。因此，我们采用另一种方案：一个统一的数据表（data_value）以键值对形式存储每个单元格的数据，加上表ID、行ID、字段ID。这样就是EAV（Entity-Attribute-Value）模型。

权衡后，我们选择动态表结构，因为多维表格的字段结构相对固定，且对查询性能要求高。动态表结构设计：

元数据部分：

- 表（table）：存储表格的基本信息

- 字段（column）：存储每个字段的信息，包括所属表、字段类型、配置等

数据部分：

每个表格对应一张数据表，表名规则：data_<table_id>，表结构在创建字段时动态变更（增加列）。表结构包含：

id: 主键（即行ID）

created_by, created_time, updated_by, updated_time

以及每个字段对应一列，列名使用字段ID（例如col_123）

这样，查询和过滤都可以直接使用SQL，效率高。缺点是需要动态管理表结构，但我们可以通过数据库的DDL语句来实现。

此外，还需要处理关联字段（查找引用）。关联字段存储的是关联行的ID，在查询时可能需要跨表查询。

视图（View）存储为一条记录，包含过滤条件、排序规则、分组规则等，在查询数据时动态应用。

权限部分：我们设计权限表，控制用户对表、行、列的访问。

具体数据库表设计如下：

1. 用户表（user）

id, username, password, email, create_time, update_time

2. 表格表（table）

id, name, creator_id, create_time, update_time, description

3. 字段表（column）

id, table_id, name, type (enum: 'text','number','date','user','link'等), config (JSON格式，存储字段配置，如关联表ID、是否唯一等), order_index

4. 视图表（view）

id, table_id, name, type (grid, kanban, etc.), config (JSON格式，存储过滤条件、排序、分组等), creator_id, create_time, update_time

5. 权限表（permission）

id, user_id, resource_type (表、行、列), resource_id, permission (读、写、管理等)

6. 行数据表：每个表格单独一张表，表名：data_<table_id>，表结构示例：

id (bigint, 主键),

creator_id,

create_time,

updater_id,

update_time,

col_1 (varchar, 对应字段1),

col_2 (int, 对应字段2),

...

但是，动态表结构在Java中需要动态操作，我们可以通过MyBatis Plus的动态SQL和动态表名支持来实现。

7. 关联表（用于存储跨表关联，但关联字段其实已经存储在字段的config中，并且数据表中存储的是关联行的ID，所以可以不需要单独的关联表。查询时通过JOIN实现）

初始化脚本（MySQL）示例：

注意：我们使用MySQL 5.7+，支持JSON类型。

创建数据库：

CREATE DATABASE IF NOT EXISTS multi_table_system DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

使用数据库：

USE multi_table_system;

用户表：

```sql

CREATE TABLE `user` (

`id` bigint(20) NOT NULL AUTO_INCREMENT,

`username` varchar(50) NOT NULL COMMENT '用户名',

`password` varchar(100) NOT NULL COMMENT '密码',

`email` varchar(100) DEFAULT NULL COMMENT '邮箱',

`create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,

`update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

PRIMARY KEY (`id`),

UNIQUE KEY `uk_username` (`username`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

```

表格表：

```sql

CREATE TABLE `table` (

`id` bigint(20) NOT NULL AUTO_INCREMENT,

`name` varchar(100) NOT NULL COMMENT '表格名称',

`creator_id` bigint(20) NOT NULL COMMENT '创建人ID',

`create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,

`update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

`description` varchar(500) DEFAULT NULL COMMENT '描述',

PRIMARY KEY (`id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='表格元数据表';

```

字段表：

```sql

CREATE TABLE `column` (

`id` bigint(20) NOT NULL AUTO_INCREMENT,

`table_id` bigint(20) NOT NULL COMMENT '所属表格ID',

`name` varchar(100) NOT NULL COMMENT '字段名称',

`type` varchar(20) NOT NULL COMMENT '字段类型：text, number, date, user, link, formula等',

`config` json DEFAULT NULL COMMENT '字段配置，JSON格式',

`order_index` int(11) NOT NULL DEFAULT '0' COMMENT '排序索引',

PRIMARY KEY (`id`),

KEY `idx_table_id` (`table_id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='字段元数据表';

```

视图表：

```sql

CREATE TABLE `view` (

`id` bigint(20) NOT NULL AUTO_INCREMENT,

`table_id` bigint(20) NOT NULL COMMENT '所属表格ID',

`name` varchar(100) NOT NULL COMMENT '视图名称',

`type` varchar(50) NOT NULL COMMENT '视图类型：grid, gallery, kanban, form等',

`config` json NOT NULL COMMENT '视图配置，包括过滤、排序、分组等',

`creator_id` bigint(20) NOT NULL COMMENT '创建人ID',

`create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,

`update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

PRIMARY KEY (`id`),

KEY `idx_table_id` (`table_id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='视图表';

```

权限表：

```sql

CREATE TABLE `permission` (

`id` bigint(20) NOT NULL AUTO_INCREMENT,

`user_id` bigint(20) NOT NULL COMMENT '用户ID',

`resource_type` varchar(20) NOT NULL COMMENT '资源类型：table, row, column',

`resource_id` bigint(20) NOT NULL COMMENT '资源ID（表ID、行ID、字段ID）',

`permission` varchar(20) NOT NULL COMMENT '权限：read, write, manage',

PRIMARY KEY (`id`),

UNIQUE KEY `uk_user_resource` (`user_id`,`resource_type`,`resource_id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限表';

```

行数据表不会在初始化时创建，而是在创建表格后，根据字段动态创建。例如，当用户创建一个表格并添加字段后，系统会执行DDL创建数据表。

示例：创建数据表的DDL（在Java中动态执行）：

```sql

CREATE TABLE `data_123` (

`id` bigint(20) NOT NULL AUTO_INCREMENT,

`creator_id` bigint(20) NOT NULL,

`create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,

`updater_id` bigint(20) DEFAULT NULL,

`update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

PRIMARY KEY (`id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='表格123的数据表';

```

当用户添加一个字段（例如ID为456的文本字段）时，执行：

```sql

ALTER TABLE `data_123` ADD COLUMN `col_456` varchar(255) DEFAULT NULL COMMENT '文本字段';

```

当用户删除字段时，删除对应的列。

系统架构设计：

1. 动态表结构管理服务（DynamicTableService）：

- 负责创建数据表、修改表结构（添加列、删除列、修改列类型等）

- 使用Spring的JdbcTemplate执行DDL语句

2. 数据访问层：

- 使用MyBatis Plus，但需要动态切换表名（表名=data_<table_id>）

- 动态SQL构建：根据字段元数据，动态拼接查询条件（特别是视图的过滤、排序等）

3. 权限拦截：

- 在业务方法前，通过AOP检查用户对当前表、行、列的权限

4. 关联字段处理：

- 在查询数据时，如果字段是关联类型（link），则需要查询关联表的数据。可以在查询主表后，再根据关联的ID批量查询关联表，然后组装数据（避免JOIN，因为关联表是动态的）

5. 视图查询：

- 将视图的配置（过滤、排序等）转换为SQL的WHERE和ORDER BY等条件

6. 缓存：

- 使用Redis缓存元数据（表、字段、视图等），以及用户权限数据

7. 公式计算：

- 设计公式引擎，解析公式（如SUM, AVG等），在查询时转换为SQL函数，或者定时计算（对于复杂公式）

考虑到时间，先不实现公式字段。

系统扩展性：

- 当表格数量和数据量增大时，可以考虑分库分表，例如按表格ID分库。

- 数据表的分片：由于每个表格数据独立存储，所以天然支持按表分库。但单个表格数据过大时，可以考虑将单个表格的数据分片（例如按行ID分片）。

安全：

- 所有动态DDL操作需要严格校验，防止SQL注入。

- 权限校验必须全面。

总结：

该设计采用动态表结构来保证查询性能，同时用元数据表管理结构。在实现时，动态表结构操作需要谨慎处理，并做好事务管理（例如添加字段和更新元数据要在一个事务中）。

初始化脚本完成。

多维表格系统架构设计方案
作为Java系统架构师，我将设计一个高性能、可扩展的多维表格系统，以下是我的设计方案：

系统架构设计
Diagram
Code












核心组件说明
API Gateway：Spring Cloud Gateway，统一入口处理请求路由

认证授权服务：Spring Security + OAuth2，实现细粒度权限控制

表格元数据服务：管理表格、字段、视图等元数据

数据存储服务：处理数据读写操作

公式计算引擎：Groovy脚本引擎实现复杂计算

视图渲染服务：动态生成表格视图

数据库设计方案
元数据存储（MySQL）
sql
-- 用户表
CREATE TABLE `mt_user` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(100) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 团队表
CREATE TABLE `mt_team` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `owner_id` BIGINT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`owner_id`) REFERENCES `mt_user`(`id`)
);

-- 表格表
CREATE TABLE `mt_table` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `team_id` BIGINT NOT NULL,
  `description` TEXT,
  `created_by` BIGINT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`team_id`) REFERENCES `mt_team`(`id`),
  FOREIGN KEY (`created_by`) REFERENCES `mt_user`(`id`)
);

-- 字段表
CREATE TABLE `mt_field` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `table_id` BIGINT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `type` ENUM('TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'USER', 'FORMULA', 'LINK') NOT NULL,
  `config` JSON NOT NULL COMMENT '字段配置JSON',
  `order_index` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`table_id`) REFERENCES `mt_table`(`id`)
);

-- 视图表
CREATE TABLE `mt_view` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `table_id` BIGINT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `type` ENUM('GRID', 'KANBAN', 'GALLERY', 'FORM') NOT NULL,
  `config` JSON NOT NULL COMMENT '视图配置JSON',
  `created_by` BIGINT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`table_id`) REFERENCES `mt_table`(`id`),
  FOREIGN KEY (`created_by`) REFERENCES `mt_user`(`id`)
);

-- 权限表
CREATE TABLE `mt_permission` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `resource_type` ENUM('TABLE', 'ROW', 'FIELD') NOT NULL,
  `resource_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `access_level` ENUM('READ', 'WRITE', 'MANAGE') NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_resource_user` (`resource_type`, `resource_id`, `user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `mt_user`(`id`)
);
数据存储方案（混合存储）
sql
-- 行数据表（MySQL） - 核心结构化数据
CREATE TABLE `mt_row_data` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `table_id` BIGINT NOT NULL,
  `created_by` BIGINT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_by` BIGINT NOT NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_table` (`table_id`)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC;

-- 单元格数据表（MongoDB文档结构示例）
{
  "_id": ObjectId,
  "row_id": Long,
  "field_id": Long,
  "table_id": Long,
  "value": {}, // 根据字段类型动态存储
  "version": Integer
}
初始化数据库脚本
sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS multi_table_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE multi_table_db;

-- 创建用户表
CREATE TABLE `mt_user` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(100) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 创建团队表
CREATE TABLE `mt_team` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `owner_id` BIGINT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`owner_id`) REFERENCES `mt_user`(`id`)
) ENGINE=InnoDB;

-- 创建表格表
CREATE TABLE `mt_table` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `team_id` BIGINT NOT NULL,
  `description` TEXT,
  `created_by` BIGINT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`team_id`) REFERENCES `mt_team`(`id`),
  FOREIGN KEY (`created_by`) REFERENCES `mt_user`(`id`)
) ENGINE=InnoDB;

-- 创建字段表
CREATE TABLE `mt_field` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `table_id` BIGINT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `type` ENUM('TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'USER', 'FORMULA', 'LINK') NOT NULL,
  `config` JSON NOT NULL COMMENT '字段配置JSON',
  `order_index` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`table_id`) REFERENCES `mt_table`(`id`)
) ENGINE=InnoDB;

-- 创建视图表
CREATE TABLE `mt_view` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `table_id` BIGINT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `type` ENUM('GRID', 'KANBAN', 'GALLERY', 'FORM') NOT NULL,
  `config` JSON NOT NULL COMMENT '视图配置JSON',
  `created_by` BIGINT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`table_id`) REFERENCES `mt_table`(`id`),
  FOREIGN KEY (`created_by`) REFERENCES `mt_user`(`id`)
) ENGINE=InnoDB;

-- 创建权限表
CREATE TABLE `mt_permission` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `resource_type` ENUM('TABLE', 'ROW', 'FIELD') NOT NULL,
  `resource_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `access_level` ENUM('READ', 'WRITE', 'MANAGE') NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_resource_user` (`resource_type`, `resource_id`, `user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `mt_user`(`id`)
) ENGINE=InnoDB;

-- 创建行数据表
CREATE TABLE `mt_row_data` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `table_id` BIGINT NOT NULL,
  `created_by` BIGINT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_by` BIGINT NOT NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_table` (`table_id`),
  FOREIGN KEY (`table_id`) REFERENCES `mt_table`(`id`),
  FOREIGN KEY (`created_by`) REFERENCES `mt_user`(`id`),
  FOREIGN KEY (`updated_by`) REFERENCES `mt_user`(`id`)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC;

-- 初始化管理员用户
INSERT INTO `mt_user` (`username`, `email`, `password_hash`) 
VALUES ('admin', 'admin@multitable.com', '$2a$10$XptfskLsT1l/bRTLRiiCgejHqOpgXFreUnNUa35gJdCr2v2QbVFzu');

-- 初始化默认团队
INSERT INTO `mt_team` (`name`, `owner_id`) 
VALUES ('Default Team', (SELECT id FROM mt_user WHERE username = 'admin'));

-- 初始化示例表格
INSERT INTO `mt_table` (`name`, `team_id`, `description`, `created_by`) 
VALUES ('Project Tasks', 
        (SELECT id FROM mt_team WHERE name = 'Default Team'),
        'Sample project management table',
        (SELECT id FROM mt_user WHERE username = 'admin'));

-- 初始化示例字段
INSERT INTO `mt_field` (`table_id`, `name`, `type`, `config`, `order_index`) 
VALUES 
((SELECT id FROM mt_table WHERE name = 'Project Tasks'), 'Task Name', 'TEXT', '{"maxLength": 100}', 1),
((SELECT id FROM mt_table WHERE name = 'Project Tasks'), 'Due Date', 'DATE', '{"format": "YYYY-MM-DD"}', 2),
((SELECT id FROM mt_table WHERE name = 'Project Tasks'), 'Assignee', 'USER', '{"multiple": false}', 3),
((SELECT id FROM mt_table WHERE name = 'Project Tasks'), 'Status', 'LINK', '{"linkedTableId": 2}', 4);

-- 初始化默认视图
INSERT INTO `mt_view` (`table_id`, `name`, `type`, `config`, `created_by`) 
VALUES 
((SELECT id FROM mt_table WHERE name = 'Project Tasks'), 
 'Default View', 
 'GRID', 
 '{"filters": [], "sorters": [{"fieldId": 2, "order": "ASC"}]}',
 (SELECT id FROM mt_user WHERE username = 'admin'));

-- 初始化权限
INSERT INTO `mt_permission` (`resource_type`, `resource_id`, `user_id`, `access_level`)
VALUES 
('TABLE', (SELECT id FROM mt_table WHERE name = 'Project Tasks'), 
 (SELECT id FROM mt_user WHERE username = 'admin'), 
 'MANAGE');
关键技术实现
1. 动态字段处理
java
// FieldValue 实体
@Entity
@Table(name = "mt_field_value")
@DynamicUpdate
public class FieldValue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "row_id")
    private Long rowId;
    
    @Column(name = "field_id")
    private Long fieldId;
    
    // 根据字段类型存储不同数据
    @Column(name = "string_value")
    private String stringValue;
    
    @Column(name = "number_value")
    private Double numberValue;
    
    @Column(name = "date_value")
    private LocalDateTime dateValue;
    
    @Column(name = "boolean_value")
    private Boolean booleanValue;
    
    @Column(name = "json_value")
    private String jsonValue; // 用于复杂类型存储
    
    // 关联字段处理
    @Transient
    private List<Long> linkedRowIds;
}
2. 公式计算引擎
java
public class FormulaEngine {
    private static final GroovyShell groovyShell = new GroovyShell();
    
    public Object calculate(String formula, Map<String, Object> context) {
        // 注入上下文变量
        context.forEach((key, value) -> 
            groovyShell.setVariable(key, value));
        
        try {
            return groovyShell.evaluate(formula);
        } catch (Exception e) {
            throw new FormulaCalculationException("Formula calculation error", e);
        }
    }
}

// 使用示例
FormulaEngine engine = new FormulaEngine();
Map<String, Object> context = new HashMap<>();
context.put("price", 100);
context.put("quantity", 5);
Object result = engine.calculate("price * quantity * 0.9", context); // 450.0
3. 权限控制实现
java
@Aspect
@Component
public class PermissionAspect {
    @Autowired
    private PermissionService permissionService;
    
    @Before("@annotation(requirePermission)")
    public void checkPermission(JoinPoint joinPoint, RequirePermission requirePermission) {
        ResourceType resourceType = requirePermission.resourceType();
        AccessLevel requiredLevel = requirePermission.level();
        
        // 从请求上下文中获取资源ID和用户ID
        Long resourceId = getResourceIdFromRequest();
        Long userId = getCurrentUserId();
        
        if (!permissionService.hasPermission(userId, resourceType, resourceId, requiredLevel)) {
            throw new AccessDeniedException("Permission denied");
        }
    }
}

// 使用注解控制权限
@RequirePermission(resourceType = ResourceType.ROW, level = AccessLevel.WRITE)
@PutMapping("/rows/{rowId}")
public ResponseEntity<?> updateRow(@PathVariable Long rowId, @RequestBody RowUpdateRequest request) {
    // 更新行逻辑
}
性能优化策略
数据分片存储

单表超过100万行时自动分表

按时间范围或ID范围进行水平分片

缓存策略

java
// 使用Redis缓存表格元数据
@Cacheable(value = "tableMeta", key = "#tableId")
public TableMeta getTableMeta(Long tableId) {
    return tableRepository.findById(tableId)
            .orElseThrow(() -> new ResourceNotFoundException("Table not found"));
}

// 视图结果缓存
@Cacheable(value = "viewData", key = "#viewId + ':' + #paramsHash")
public ViewResult getViewData(Long viewId, Map<String, Object> params) {
    // 复杂视图计算逻辑
}
批量操作优化

java
// 批量更新服务
@Transactional
public void batchUpdateCells(Long tableId, List<CellUpdate> updates) {
    // 1. 分组处理不同类型字段
    Map<FieldType, List<CellUpdate>> groupedUpdates = updates.stream()
        .collect(Collectors.groupingBy(CellUpdate::getFieldType));
    
    // 2. 并行处理不同组
    groupedUpdates.forEach((type, list) -> {
        switch (type) {
            case TEXT:
                textFieldService.batchUpdate(list);
                break;
            case NUMBER:
                numberFieldService.batchUpdate(list);
                break;
            // 其他类型处理...
        }
    });
    
    // 3. 触发关联更新
    relationService.processDependentUpdates(tableId, updates);
}
扩展性设计
插件化字段类型

java
public interface FieldTypeHandler {
    String getType();
    Object parseValue(Object rawValue);
    void validate(FieldConfig config, Object value);
    Object formatValue(Object value);
}

// 注册处理器
@Component
public class FieldHandlerRegistry {
    private final Map<String, FieldTypeHandler> handlers = new ConcurrentHashMap<>();
    
    public void registerHandler(FieldTypeHandler handler) {
        handlers.put(handler.getType(), handler);
    }
    
    public FieldTypeHandler getHandler(String type) {
        return handlers.get(type);
    }
}
开放API设计

java
@RestController
@RequestMapping("/api/v1/tables")
public class TableApiController {
    
    @PostMapping("/{tableId}/webhooks")
    public ResponseEntity<?> createWebhook(
            @PathVariable Long tableId,
            @RequestBody WebhookCreateRequest request) {
        // 创建Webhook逻辑
    }
    
    @PostMapping("/{tableId}/rows")
    public ResponseEntity<RowData> createRow(
            @PathVariable Long tableId,
            @RequestBody RowCreateRequest request) {
        // 创建行逻辑
    }
}
安全设计
数据加密：AES-256加密敏感数据

权限验证：基于RBAC和ABAC的混合模型

审计日志：记录所有数据变更操作

速率限制：Guava RateLimiter控制API调用频率

沙箱环境：公式计算在独立沙箱中执行

本设计方案提供了高扩展性的架构，支持百万级数据量，通过混合存储方案平衡了灵活性和性能需求，插件化设计便于后续扩展新功能。

### 多维表格参考

https://juejin.cn/post/7511649092658577448  
https://juejin.cn/post/7493733975779475493

 - 飞书的多维表格的快速上手文档
 https://visactor.io/blog/vtable
 - 飞书多维表格的帮助文档
 https://visactor.io/vtable/

