# mt_user 与 mt_team 关系设计详解
我已经为您详细分析并优化了用户与团队的关系设计。以下是核心要点：
🔗 关系模型架构
graph TB
    subgraph "核心实体"
        A[mt_tenant<br/>租户] 
        B[mt_user<br/>用户]
        C[mt_team<br/>团队]
    end
    
    subgraph "关系实体"
        D[mt_team_member<br/>团队成员关系]
        E[mt_team_invitation<br/>团队邀请]
        F[mt_team_role<br/>角色定义]
    end
    
    subgraph "业务实体"
        G[mt_table<br/>表格]
        H[mt_permission<br/>权限]
    end
    
    A -->|1:N| B
    A -->|1:N| C
    B -->|N:M| D
    C -->|N:M| D
    D -->|N:1| F
    D -->|1:N| E
    C -->|1:N| G
    B -->|1:N| H


关系类型分析
关系类型	描述	实现方式	业务场景
多对多	用户可加入多个团队<br/>团队包含多个用户	mt_team_member中间表	✅ 推荐使用
一对多	用户只能属于一个团队	mt_user.team_id	❌ 限制灵活性
简单关联	仅通过owner关联	mt_team.owner_id	❌ 功能不完整

1. 灵活的成员关系
-- 支持用户加入多个团队，每个团队有不同角色
SELECT u.real_name, t.name as team_name, tm.role 
FROM mt_user u
JOIN mt_team_member tm ON u.id = tm.user_id
JOIN mt_team t ON tm.team_id = t.id
WHERE u.id = 1003;

2. 层次化角色权限
-- 角色权限定义
owner   -> 所有权限 (team.*, member.*, table.*, permission.*)
admin   -> 管理权限 (member.*, table.*, permission.*)  
member  -> 基础权限 (table.create, data.*)
viewer  -> 只读权限 (data.read)

3. 完整的邀请机制
-- 邀请流程支持
1. 发送邀请 -> mt_team_invitation (待处理)
2. 生成token -> invitation_token (7天有效期)
3. 接受邀请 -> mt_team_member (正式成员)
4. 权限生效 -> 基于角色的权限控制

4. 业务逻辑封装
graph TB
    subgraph "核心实体"
        A[mt_tenant<br/>租户] 
        B[mt_user<br/>用户]
        C[mt_team<br/>团队]
    end
    
    subgraph "关系实体"
        D[mt_team_member<br/>团队成员关系]
        E[mt_team_invitation<br/>团队邀请]
        F[mt_team_role<br/>角色定义]
    end
    
    subgraph "业务实体"
        G[mt_table<br/>表格]
        H[mt_permission<br/>权限]
    end
    
    A -->|1:N| B
    A -->|1:N| C
    B -->|N:M| D
    C -->|N:M| D
    D -->|N:1| F
    D -->|1:N| E
    C -->|1:N| G
    B -->|1:N| H

安全性保障
1. 数据隔离
所有关系表都包含 tenant_id，确保租户间数据隔离
触发器自动验证租户一致性
2. 权限验证
邀请权限检查：只有具备 member.invite 权限的用户才能邀请
角色变更检查：不能修改团队所有者角色
跨租户操作防护：阻止跨租户的成员邀请
3. 数据完整性
外键约束确保引用完整性
唯一索引防止重复成员关系
状态字段支持软删除和邀请状态管理

查询性能优化
1. 核心索引
-- 支持用户加入多个团队，每个团队有不同角色
SELECT u.real_name, t.name as team_name, tm.role 
FROM mt_user u
JOIN mt_team_member tm ON u.id = tm.user_id
JOIN mt_team t ON tm.team_id = t.id
WHERE u.id = 1003;

2. 视图查询优化

-- 角色权限定义
owner   -> 所有权限 (team.*, member.*, table.*, permission.*)
admin   -> 管理权限 (member.*, table.*, permission.*)  
member  -> 基础权限 (table.create, data.*)
viewer  -> 只读权限 (data.read)

扩展功能支持
1. 支持复杂场景
✅ 用户跨团队协作
✅ 临时访客权限
✅ 邀请外部用户
✅ 角色权限定制
✅ 团队权限继承
2. 业务流程
✅ 用户注册后自动创建个人团队
✅ 团队解散时成员转移
✅ 批量邀请和导入
✅ 邀请过期自动清理
总结：优化后的设计通过 mt_team_member 中间表实现了灵活的多对多关系，支持角色管理、邀请机制和完整的权限控制，为多维表格系统提供了强大的组织架构基础。