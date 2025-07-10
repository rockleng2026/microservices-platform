1. 需求分析
   需要实现一个财务健康分析系统，核心功能包括：
      计算盈亏平衡点（营业额）
   计算当月净利润
   支持三种场景分析
   模型管理与预测分析   
   模型参数自定义
      模型管理 
         ==>定义模型
         模型变量定义
         每月固定运营成本 = 输入 备注
         总固定成本 = 引用  加法/减法/乘积/除法/均值/api(url 参数A 参数B 值).

         ==>保存模型

         模型预测分析
         ==>加载模型
         ==>填写基础数据 类型为输入的模型变量 或者为api汇总 手动点击获取
         ==>下层动态显示
   多周期（月/季/半年/年）指标展示

2. 系统设计
   2.1 核心计算模型
\begin{aligned}
\text{总固定成本} &= \text{应发工资} + \text{社保公积金} + \text{固定运营成本} \\
\text{当月净利润} &= (\text{实际营业额} \times \text{毛利率}) - \text{总固定成本} - (\text{实际营业额} \times \text{变动成本率}) \\
\text{盈亏平衡点} &= \frac{\text{总固定成本}}{\text{毛利率} - \text{变动成本率}}
\end{aligned}
2.2 场景分析
场景A：不同毛利率(10%/30%/65%)下的盈亏平衡点

场景B：固定成本增加时，达到盈亏平衡所需的营业额

场景C：固定成本增加且营业额不变时，达到盈亏平衡所需的毛利率

3. 数据库表结构设计
   3.1 模型表 (financial_model)
   字段名	类型	描述
   id	BIGINT PRIMARY KEY	模型ID
   name	VARCHAR(100)	模型名称
   created_at	TIMESTAMP	创建时间
   updated_at	TIMESTAMP	更新时间
   3.2 模型变量表 (model_variable)
   字段名	类型	描述
   id	BIGINT PRIMARY KEY	变量ID
   model_id	BIGINT	关联模型ID
   name	VARCHAR(50)	变量名称
   key	VARCHAR(50)	变量标识(英文)
   type	ENUM('input','calc','api')	变量类型(输入/计算/API)
   expression	TEXT	计算公式或API配置
   note	TEXT	备注说明
   sort_order	INT	显示顺序

4. 核心模型变量定义
   变量名	标识	类型	表达式/说明
   每月固定运营成本	fixed_cost	input	用户输入
   应发工资	salary	input	用户输入
   社保公积金	social_insurance	input	用户输入
   当月实际总营业额	revenue	input	用户输入
   当月平均毛利率	gross_margin	input	用户输入
   其他变动成本率	variable_cost_rate	input	用户输入
   总固定成本	total_fixed_cost	calc	salary + social_insurance + fixed_cost
   当月净利润	net_profit	calc	(revenue * gross_margin) - total_fixed_cost - (revenue * variable_cost_rate)
   盈亏平衡点	breakeven_point	calc	total_fixed_cost / (gross_margin - variable_cost_rate)

预测结果展示
指标	当月	当季	半年	年度
总固定成本	3,084,378.74	N/A	N/A	N/A
当月净利润	-807,378.74	N/A	N/A	N/A
盈亏平衡点 (营业额)	13,410,342.34	40,231,027.03	80,462,054.05	160,924,108.11
计算说明：

当季值 = 当月值 × 3

半年值 = 当月值 × 6

年度值 = 当月值 × 12



5. API接口设计
   7.1 模型管理
   POST /models 创建新模型

PUT /models/{id} 更新模型

GET /models 获取模型列表

GET /models/{id} 获取模型详情

7.2 变量管理
POST /models/{modelId}/variables 添加变量

PUT /variables/{id} 更新变量

DELETE /variables/{id} 删除变量

