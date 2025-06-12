请你基于@webui.md @prd.md @organization.md @Portal用户系统功能实现总结.md 中关于组织架构体系、部门管理、权限系统的设计
按现有设计方案和高保真原型页面，继续开始开发portal系统组织管理模块下部门部门管理的所有功能 @portal-web
要求：
开发完毕后，给出部门管理菜单的链接url，点击部门管理菜单打开部门菜单管理页面
数据库库表设计必须完全参考 @organization-module.sql 的设计
前端页面参考沿用前端工程 整体框架，页面参考高保真原型页面 @ 前端功能整体布局 页面原型参考 @/docs/html/organization/department-tree.html 页面样式、布局、菜单请严格按照原型进行输出
后端微服务 @organization-service  后端微服务接口 @zlt-business/organization-service/src/main/java/com/central/organization/controller/DepartmentController.java
租户ID，每次请求头部带上x-tenant-header
调用后端服务统一走网关 组织模块微服务的访问地址是 http://127.0.0.1:9900/api-portal

