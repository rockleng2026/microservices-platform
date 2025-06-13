请你基于@webui.md @prd.md @organization.md @Portal用户系统功能实现总结.md @organization-module.sql 中关于组织架构体系、部门管理、岗位管理、岗位权限系统的设计
按现有设计方案和高保真原型页面参考 @html 继续开始开发portal系统组织管理模块下岗位管理菜单页面的所有功能 包括前后端的实现
要求：
数据库库表设计必须完全严格参考 @organization-module.sql 的设计
前端页面参考沿用前端工程 整体框架，页面参考高保真原型页面 @ 前端功能整体布局 页面原型参考 @position-manage.html @workposition-permission.html 页面样式、布局、菜单请严格按照原型进行输出
前端工程 @portal-web 后端微服务工程 @organization-service 
租户ID，每次请求头部带上x-tenant-header
id字段前后端传递时需要转换，因为long类型的id传递时会丢失精度，前端页面内部传递时也需要注意，部门管理开发时已发现问题

