# OAuth 401错误解决方案

## 问题原因
客户端认证失败：`Client authentication failed: authentication_method`

这是因为数据库中缺少 `portal-web` 客户端配置。

## 解决步骤

### 1. 添加OAuth客户端配置

**手动执行以下SQL语句：**

```sql
USE oauth-center;

INSERT INTO oauth_client_details 
(client_id, resource_ids, client_secret, client_secret_str, scope, authorized_grant_types, web_server_redirect_uri, authorities, access_token_validity, refresh_token_validity, additional_information, autoapprove, create_time, update_time, client_name, token_format, creator_id) 
VALUES 
('portal-web', NULL, '$2a$10$YWKmKo8naV5gekYzrD5K7uXYF8.7fOCcCxDCp1XQJzRbLhm9YGlgS', 'portal-secret', 'app,openid,profile', 'password,refresh_token,client_credentials', 'http://127.0.0.1:8065', NULL, 3600, 28800, '{}', 'true', NOW(), NOW(), 'Portal门户前端', 'reference', 1);
```

**验证是否插入成功：**

```sql
SELECT client_id, client_secret_str, scope, authorized_grant_types 
FROM oauth_client_details 
WHERE client_id = 'portal-web';
```

### 2. 重启UAA服务

由于客户端配置会被缓存，需要重启UAA服务：

```bash
# 停止UAA服务
# 重新启动UAA服务
cd zlt-uaa
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dzlt.datasource.username=root -Dzlt.datasource.password=lengfeng847"
```

### 3. 测试OAuth Token接口

使用以下参数测试：

```
POST http://127.0.0.1:9900/api-uaa/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=password&username=admin&password=admin123&client_id=portal-web&client_secret=portal-secret&account_type=portal
```

### 4. 启动前端项目

```bash
cd zlt-web/portal-web
npm run dev
```

前端将在 http://127.0.0.1:8065 启动

## 关键配置信息

- **客户端ID**: portal-web
- **客户端密钥**: portal-secret
- **OAuth Token地址**: http://127.0.0.1:9900/api-uaa/oauth/token
- **前端地址**: http://127.0.0.1:8065
- **测试账号**: admin / admin123

## 说明

已修改前端代码使用正确的OAuth路径：`/api-uaa/oauth/token`（通过网关路由）而不是直接的 `/oauth/token`。 