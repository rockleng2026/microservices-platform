USE `oauth-center`;

INSERT INTO `oauth_client_details` 
(`client_id`, `resource_ids`, `client_secret`, `client_secret_str`, `scope`, `authorized_grant_types`, `web_server_redirect_uri`, `authorities`, `access_token_validity`, `refresh_token_validity`, `additional_information`, `autoapprove`, `create_time`, `update_time`, `client_name`, `token_format`, `creator_id`) 
VALUES 
('portal-web', NULL, '$2a$10$YWKmKo8naV5gekYzrD5K7uXYF8.7fOCcCxDCp1XQJzRbLhm9YGlgS', 'portal-secret', 'app,openid,profile', 'password,refresh_token,client_credentials', 'http://127.0.0.1:8065', NULL, 3600, 28800, '{}', 'true', NOW(), NOW(), 'Portal门户前端', 'reference', 1);

SELECT * FROM `oauth_client_details` WHERE `client_id` = 'portal-web'; 