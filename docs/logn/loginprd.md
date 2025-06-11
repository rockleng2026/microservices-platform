# 多用户登录需求
我想基于microservices-platform的整体框架和支持多用户登录的能力，现在我要做一个portal业务系统的用户登录页面，
ACCOUNT_TYPE为portal类型的用户通过用户名密码登录后，获取用户下所有的菜单权限，导航菜单动态展示，比如我是一个portal系统的中一个租户下的用户，我登录成功后，可以看到我当前岗位所有的菜单，我可以点击菜单进行办公，比如部门管理、员工管理等，同时我可以切换我的岗位，切换后且不换到这个岗位下的对应的菜单

请根据数据库设计参考 @sql/organization-module.sql和登录页面参考原型页面 @docs/html/auth/login.html
开发一个新的用户类型的登录，
用户授权登陆及多用户登录说明参考 @docs/logn/loginAuth.md @docs/logn/multUseLogin.md
登录前端参考 @zlt-web/layui-web/src/main/resources/static/login.html
后端服务参考 @zlt-uaa @zlt-business/user-center
注意：
新的用户登录使用的单独的数据,数据库连接是 127.0.0.1:3306 用户名是root 密码是lengfeng847 组织模块的数据库名是central_organization
新的业务类型我根据文档说明中的实现我已经新建了一个类 @PortalUserDetailServiceImpl.java ACCOUNT_TYPE=portal 请在这个里面实现，实现方式参考@UserDetailServiceImpl.java
登录成功后需要获取用户的所有权限菜单,请求地址定为api-portal-org/menus/current
 方式参考http://127.0.0.1:9900/api-user/menus/current的实现
前端使用@portal-web，后端涉及用户、菜单、部门、岗位、岗位权限的功能代码放到@organization-service
menus/current的具体实现逻辑：
新用户权限 
获取到当前的用户id和租户id然后 根据用户的员工id 关联部门岗位(主管岗位、分管岗位)
- ✅ 基于岗位的权限控制 (workpositon表、workposition_manage_dept表)
- ✅ 功能权限管理 (menu_page、menu_func表)
- ✅ 数据权限管理 (租户级隔离)
- ✅ 岗位权限配置 (workposition.menu_ids,workposition.menu_func_ids)
数据参考@sample-data.sql