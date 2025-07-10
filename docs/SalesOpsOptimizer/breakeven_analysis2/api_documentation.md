# 盈亏平衡分析增强版 API 接口文档

## 1. 接口概述

### 1.1 基础信息
- **服务名称**: saleops-optimizer
- **服务端口**: 7006
- **API版本**: v2.0
- **基础路径**: `/api/soo/v2`
- **认证方式**: OAuth2 + JWT

### 1.2 通用响应格式
```json
{
  "success": true,
  "code": 200,
  "message": "操作成功",
  "data": {}, 
  "timestamp": "2024-12-19T10:30:00Z",
  "traceId": "trace-12345"
}
```

### 1.3 错误响应格式
```json
{
  "success": false,
  "code": 400,
  "message": "参数验证失败",
  "error": {
    "type": "VALIDATION_ERROR",
    "details": ["model_name不能为空", "variable_code格式不正确"]
  },
  "timestamp": "2024-12-19T10:30:00Z",
  "traceId": "trace-12345"
}
```

## 2. 模型管理接口

### 2.1 创建财务模型

**接口地址**: `POST /api/soo/v2/models`

**请求参数**:
```json
{
  "modelCode": "profit_analysis_v1",
  "modelName": "利润分析模型",
  "modelCategory": "PROFIT_ANALYSIS", 
  "modelDescription": "用于计算公司月度利润分析的模型",
  "parentModelId": null,
  "isTemplate": false,
  "modelConfig": {
    "calculationMode": "REAL_TIME",
    "validationLevel": "STRICT",
    "cacheEnabled": true
  },
  "validationRules": {
    "maxVariables": 50,
    "maxFormulaDepth": 10,
    "requiredVariables": ["total_revenue", "total_cost"]
  }
}
```

**响应结果**:
```json
{
  "success": true,
  "data": {
    "id": 1001,
    "modelCode": "profit_analysis_v1",
    "modelName": "利润分析模型",
    "modelVersion": "1.0.0",
    "status": "ACTIVE",
    "createdTime": "2024-12-19T10:30:00Z"
  }
}
```

### 2.2 获取模型列表

**接口地址**: `GET /api/soo/v2/models`

**查询参数**:
- `page`: 页码，默认1
- `size`: 每页大小，默认20
- `category`: 模型分类筛选
- `keyword`: 关键词搜索
- `isActive`: 是否启用
- `isTemplate`: 是否模板

**响应结果**:
```json
{
  "success": true,
  "data": {
    "total": 25,
    "page": 1,
    "size": 20,
    "items": [
      {
        "id": 1001,
        "modelCode": "profit_analysis_v1",
        "modelName": "利润分析模型",
        "modelVersion": "1.0.0",
        "modelCategory": "PROFIT_ANALYSIS",
        "variableCount": 12,
        "isActive": true,
        "isTemplate": false,
        "creatorName": "张三",
        "createdTime": "2024-12-19T10:30:00Z",
        "lastUsedTime": "2024-12-19T14:20:00Z"
      }
    ]
  }
}
```

### 2.3 获取模型详情

**接口地址**: `GET /api/soo/v2/models/{id}`

**响应结果**:
```json
{
  "success": true,
  "data": {
    "id": 1001,
    "modelCode": "profit_analysis_v1",
    "modelName": "利润分析模型",
    "modelVersion": "1.0.0",
    "modelCategory": "PROFIT_ANALYSIS",
    "modelDescription": "用于计算公司月度利润分析的模型",
    "parentModelId": null,
    "isTemplate": false,
    "isActive": true,
    "modelConfig": {
      "calculationMode": "REAL_TIME",
      "validationLevel": "STRICT",
      "cacheEnabled": true
    },
    "variables": [
      {
        "id": 2001,
        "variableCode": "total_revenue",
        "variableName": "总营业额",
        "variableType": "INPUT",
        "dataType": "CURRENCY",
        "isRequired": true,
        "displayOrder": 1
      }
    ],
    "statistics": {
      "totalCalculations": 156,
      "averageDuration": 2500,
      "successRate": 0.985
    },
    "createdTime": "2024-12-19T10:30:00Z",
    "updatedTime": "2024-12-19T15:45:00Z"
  }
}
```

### 2.4 更新模型

**接口地址**: `PUT /api/soo/v2/models/{id}`

**请求参数**: 同创建模型，字段可选

### 2.5 克隆模型

**接口地址**: `POST /api/soo/v2/models/{id}/clone`

**请求参数**:
```json
{
  "newModelCode": "profit_analysis_v2",
  "newModelName": "利润分析模型V2",
  "includeVariables": true,
  "includeScenarios": false
}
```

## 3. 变量管理接口

### 3.1 添加模型变量

**接口地址**: `POST /api/soo/v2/models/{modelId}/variables`

**请求参数**:
```json
{
  "variableCode": "gross_profit_margin",
  "variableName": "毛利率",
  "variableType": "CALC",
  "dataType": "PERCENTAGE",
  "unit": "%",
  "calculationFormula": "(total_revenue - total_cost) / total_revenue * 100",
  "defaultValue": 30.0,
  "minValue": 0.0,
  "maxValue": 100.0,
  "displayOrder": 5,
  "isRequired": true,
  "isKeyIndicator": true,
  "description": "毛利率计算公式",
  "helpText": "毛利率 = (营业额 - 成本) / 营业额 * 100%",
  "validationRules": {
    "range": {"min": 0, "max": 100},
    "precision": 2
  }
}
```

**响应结果**:
```json
{
  "success": true,
  "data": {
    "id": 2005,
    "variableCode": "gross_profit_margin",
    "variableName": "毛利率",
    "variableType": "CALC",
    "formulaValid": true,
    "dependencies": ["total_revenue", "total_cost"],
    "createdTime": "2024-12-19T11:00:00Z"
  }
}
```

### 3.2 添加API变量

**接口地址**: `POST /api/soo/v2/models/{modelId}/variables`

**请求参数**:
```json
{
  "variableCode": "market_index",
  "variableName": "市场指数",
  "variableType": "API",
  "dataType": "NUMBER",
  "apiConfig": {
    "datasourceId": 1001,
    "interfaceId": 2001,
    "requestParams": {
      "date": "${calculation_date}",
      "type": "composite_index"
    },
    "dataPath": "data.index_value",
    "cacheEnabled": true,
    "cacheDuration": 3600,
    "fallbackValue": 100.0,
    "retryConfig": {
      "maxAttempts": 3,
      "backoffFactor": 2
    }
  },
  "displayOrder": 10,
  "isRequired": false,
  "description": "从外部API获取的市场综合指数"
}
```

### 3.3 验证计算公式

**接口地址**: `POST /api/soo/v2/variables/validate`

**请求参数**:
```json
{
  "formula": "(total_revenue - total_cost) / total_revenue * 100",
  "availableVariables": ["total_revenue", "total_cost", "fixed_cost"],
  "testData": {
    "total_revenue": 1000000,
    "total_cost": 700000,
    "fixed_cost": 300000
  }
}
```

**响应结果**:
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "parsedFormula": {
      "expression": "((total_revenue - total_cost) / total_revenue) * 100",
      "dependencies": ["total_revenue", "total_cost"],
      "returnType": "NUMBER"
    },
    "testResult": {
      "value": 30.0,
      "executionTime": 15
    },
    "warnings": [],
    "errors": []
  }
}
```

### 3.4 获取变量依赖关系

**接口地址**: `GET /api/soo/v2/models/{modelId}/variables/dependencies`

**响应结果**:
```json
{
  "success": true,
  "data": {
    "dependencyGraph": {
      "nodes": [
        {"id": "total_revenue", "type": "INPUT", "level": 0},
        {"id": "total_cost", "type": "INPUT", "level": 0},
        {"id": "gross_profit", "type": "CALC", "level": 1},
        {"id": "gross_profit_margin", "type": "CALC", "level": 2}
      ],
      "edges": [
        {"from": "total_revenue", "to": "gross_profit"},
        {"from": "total_cost", "to": "gross_profit"},
        {"from": "total_revenue", "to": "gross_profit_margin"},
        {"from": "gross_profit", "to": "gross_profit_margin"}
      ]
    },
    "calculationOrder": ["total_revenue", "total_cost", "gross_profit", "gross_profit_margin"],
    "circularDependencies": []
  }
}
```

## 4. 计算分析接口

### 4.1 创建计算实例

**接口地址**: `POST /api/soo/v2/calculations`

**请求参数**:
```json
{
  "modelId": 1001,
  "instanceName": "2024年12月利润分析",
  "calculationPeriod": "2024-12",
  "periodStartDate": "2024-12-01",
  "periodEndDate": "2024-12-31",
  "inputParameters": {
    "total_revenue": 1500000,
    "fixed_cost": 500000,
    "variable_cost_rate": 0.35,
    "base_salary": 300000,
    "social_insurance": 60000
  },
  "calculationConfig": {
    "autoExecute": true,
    "includeScenarios": true,
    "includeForecast": false,
    "scenarios": ["gross_margin_10", "gross_margin_30", "gross_margin_65"],
    "validationLevel": "NORMAL"
  }
}
```

**响应结果**:
```json
{
  "success": true,
  "data": {
    "id": 3001,
    "instanceId": "CALC_20241219_001",
    "instanceName": "2024年12月利润分析",
    "status": "PENDING",
    "estimatedDuration": 5000,
    "createdTime": "2024-12-19T11:30:00Z"
  }
}
```

### 4.2 执行计算

**接口地址**: `POST /api/soo/v2/calculations/{id}/execute`

**请求参数**:
```json
{
  "forceRecalculate": false,
  "notifyOnComplete": true,
  "priority": "NORMAL"
}
```

**响应结果**:
```json
{
  "success": true,
  "data": {
    "taskId": "TASK_20241219_001",
    "status": "RUNNING",
    "progress": 0,
    "estimatedCompletion": "2024-12-19T11:35:00Z",
    "message": "计算任务已启动"
  }
}
```

### 4.3 获取计算结果

**接口地址**: `GET /api/soo/v2/calculations/{id}`

**响应结果**:
```json
{
  "success": true,
  "data": {
    "id": 3001,
    "instanceId": "CALC_20241219_001",
    "instanceName": "2024年12月利润分析",
    "status": "COMPLETED",
    "calculationDuration": 4500,
    "inputParameters": {
      "total_revenue": 1500000,
      "fixed_cost": 500000,
      "variable_cost_rate": 0.35
    },
    "calculationResults": {
      "baselineResults": {
        "breakeven_point": 1153846.15,
        "net_profit": 175000,
        "profit_margin": 11.67,
        "safety_margin": 346153.85,
        "safety_margin_ratio": 23.08
      },
      "keyIndicators": {
        "total_fixed_cost": 860000,
        "contribution_margin_ratio": 0.65,
        "operating_leverage": 4.91
      }
    },
    "scenarioResults": [
      {
        "scenarioName": "毛利率10%场景",
        "scenarioCode": "gross_margin_10",
        "results": {
          "breakeven_point": "无法达到盈亏平衡",
          "analysis": "在10%毛利率下，贡献边际无法覆盖固定成本"
        }
      },
      {
        "scenarioName": "毛利率30%场景", 
        "scenarioCode": "gross_margin_30",
        "results": {
          "breakeven_point": 2866666.67,
          "required_revenue_increase": 91.11
        }
      }
    ],
    "riskWarnings": [
      {
        "level": "MEDIUM",
        "message": "当前安全边际率偏低，建议关注成本控制",
        "suggestion": "考虑优化变动成本率或提高销售单价"
      }
    ],
    "lastExecuted": "2024-12-19T11:34:30Z"
  }
}
```

### 4.4 批量计算

**接口地址**: `POST /api/soo/v2/calculations/batch`

**请求参数**:
```json
{
  "calculations": [
    {
      "modelId": 1001,
      "instanceName": "部门A-12月分析",
      "inputParameters": {...}
    },
    {
      "modelId": 1001, 
      "instanceName": "部门B-12月分析",
      "inputParameters": {...}
    }
  ],
  "batchConfig": {
    "maxConcurrency": 5,
    "failureHandling": "CONTINUE",
    "notifyOnComplete": true
  }
}
```

## 5. 场景分析接口

### 5.1 执行场景分析

**接口地址**: `POST /api/soo/v2/scenarios/analyze`

**请求参数**:
```json
{
  "baseCalculationId": 3001,
  "scenarios": [
    {
      "scenarioCode": "cost_increase_20",
      "scenarioName": "固定成本增加20%",
      "scenarioType": "FIXED_COST",
      "parameterAdjustments": {
        "fixed_cost": {"type": "MULTIPLY", "value": 1.2},
        "base_salary": {"type": "MULTIPLY", "value": 1.2}
      },
      "analysisConfig": {
        "calculateImpact": true,
        "compareWithBaseline": true
      }
    },
    {
      "scenarioCode": "revenue_growth_scenarios",
      "scenarioName": "营业额增长情景",
      "scenarioType": "REVENUE",
      "parameterAdjustments": {
        "total_revenue": [
          {"label": "保守增长", "value": 1.05},
          {"label": "正常增长", "value": 1.15}, 
          {"label": "乐观增长", "value": 1.30}
        ]
      }
    }
  ]
}
```

**响应结果**:
```json
{
  "success": true,
  "data": {
    "analysisId": "SCENARIO_20241219_001",
    "baselineResults": {
      "breakeven_point": 1153846.15,
      "net_profit": 175000
    },
    "scenarioResults": [
      {
        "scenarioCode": "cost_increase_20",
        "scenarioName": "固定成本增加20%",
        "results": {
          "breakeven_point": 1384615.38,
          "net_profit": 3000,
          "impact_analysis": {
            "breakeven_change": 230769.23,
            "breakeven_change_percent": 20.0,
            "profit_change": -172000,
            "profit_change_percent": -98.29
          }
        },
        "feasibilityScore": 0.65,
        "riskLevel": "HIGH",
        "recommendations": [
          "建议同步提高销售价格或营业额",
          "考虑成本优化措施"
        ]
      }
    ],
    "comparisonSummary": {
      "bestScenario": "revenue_growth_normal",
      "worstScenario": "cost_increase_20",
      "riskScenarios": ["cost_increase_20"],
      "optimalParameters": {
        "total_revenue": 1725000,
        "fixed_cost": 500000
      }
    }
  }
}
```

### 5.2 敏感性分析

**接口地址**: `POST /api/soo/v2/scenarios/sensitivity`

**请求参数**:
```json
{
  "baseCalculationId": 3001,
  "sensitivityConfig": {
    "targetVariable": "net_profit",
    "parameters": [
      {
        "variableCode": "total_revenue",
        "variationRange": {"min": -0.3, "max": 0.3, "step": 0.05},
        "enabled": true
      },
      {
        "variableCode": "variable_cost_rate", 
        "variationRange": {"min": -0.1, "max": 0.1, "step": 0.01},
        "enabled": true
      }
    ],
    "analysisType": "ONE_AT_TIME",
    "includeInteraction": false
  }
}
```

**响应结果**:
```json
{
  "success": true,
  "data": {
    "analysisId": "SENSITIVITY_20241219_001",
    "targetVariable": "net_profit",
    "baselineValue": 175000,
    "sensitivityResults": [
      {
        "parameter": "total_revenue",
        "sensitivity": {
          "elasticity": 0.65,
          "rank": 1,
          "impact_range": {"min": -292500, "max": 292500},
          "critical_points": [
            {"threshold": -0.152, "description": "盈亏平衡临界点"}
          ]
        },
        "data_points": [
          {"variation": -0.30, "value": -292500},
          {"variation": -0.15, "value": 0},
          {"variation": 0.00, "value": 175000},
          {"variation": 0.15, "value": 350000},
          {"variation": 0.30, "value": 467500}
        ]
      },
      {
        "parameter": "variable_cost_rate",
        "sensitivity": {
          "elasticity": -0.86,
          "rank": 2, 
          "impact_range": {"min": -150000, "max": 150000}
        }
      }
    ],
    "summary": {
      "most_sensitive": "total_revenue",
      "least_sensitive": "variable_cost_rate",
      "stability_score": 0.72,
      "risk_factors": [
        "营业额下降15%以上将导致亏损",
        "变动成本率上升10%将显著影响利润"
      ]
    }
  }
}
```

## 6. 预测分析接口

### 6.1 生成预测报告

**接口地址**: `POST /api/soo/v2/forecasts/generate`

**请求参数**:
```json
{
  "baseCalculationId": 3001,
  "forecastConfig": {
    "forecastPeriods": 12,
    "forecastPeriodType": "MONTHLY",
    "modelType": "ENSEMBLE",
    "includeSeasonality": true,
    "confidenceLevel": 0.95,
    "scenarios": ["OPTIMISTIC", "REALISTIC", "PESSIMISTIC"],
    "externalFactors": {
      "market_growth_rate": 0.05,
      "inflation_rate": 0.03,
      "industry_trend": "POSITIVE"
    }
  }
}
```

**响应结果**:
```json
{
  "success": true,
  "data": {
    "forecastId": "FORECAST_20241219_001",
    "baseData": {
      "historicalPeriods": 24,
      "baselineValue": 175000,
      "trend": "UPWARD",
      "seasonality": "MODERATE"
    },
    "forecastResults": {
      "realistic_scenario": [
        {
          "period": "2025-01",
          "predicted_value": 185000,
          "confidence_interval": {"lower": 160000, "upper": 210000},
          "probability": 0.68
        },
        {
          "period": "2025-02", 
          "predicted_value": 195000,
          "confidence_interval": {"lower": 165000, "upper": 225000},
          "probability": 0.68
        }
      ],
      "optimistic_scenario": [
        {
          "period": "2025-01",
          "predicted_value": 220000,
          "growth_rate": 0.26
        }
      ],
      "pessimistic_scenario": [
        {
          "period": "2025-01", 
          "predicted_value": 150000,
          "growth_rate": -0.14
        }
      ]
    },
    "modelMetrics": {
      "accuracy_score": 0.87,
      "mean_absolute_error": 15000,
      "root_mean_square_error": 22000,
      "r_squared": 0.92
    },
    "assumptions": [
      "基于历史24个月数据进行预测",
      "假设当前市场条件保持稳定",
      "未考虑重大政策变化影响"
    ],
    "recommendations": [
      "建议关注1-3月业绩表现验证预测准确性",
      "制定应对悲观情景的风险缓解措施",
      "在乐观情景下准备资源扩张计划"
    ]
  }
}
```

### 6.2 预测准确性验证

**接口地址**: `POST /api/soo/v2/forecasts/validate`

**请求参数**:
```json
{
  "forecastId": "FORECAST_20241219_001",
  "actualData": [
    {
      "period": "2025-01",
      "actual_value": 178000
    },
    {
      "period": "2025-02",
      "actual_value": 201000
    }
  ],
  "validationMetrics": ["MAPE", "MAE", "RMSE", "ACCURACY"]
}
```

## 7. 数据集成接口

### 7.1 配置API数据源

**接口地址**: `POST /api/soo/v2/datasources`

**请求参数**:
```json
{
  "datasourceCode": "hr_system_api",
  "datasourceName": "人力资源系统API",
  "datasourceType": "REST",
  "connectionConfig": {
    "baseUrl": "https://hr.company.com/api",
    "version": "v1",
    "timeout": 30
  },
  "authConfig": {
    "type": "BEARER_TOKEN",
    "tokenUrl": "https://hr.company.com/auth/token",
    "credentials": {
      "client_id": "${client_id}",
      "client_secret": "${client_secret}"
    }
  },
  "defaultHeaders": {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  "rateLimit": {
    "requests_per_minute": 100,
    "burst_limit": 20
  }
}
```

### 7.2 测试API连接

**接口地址**: `POST /api/soo/v2/datasources/{id}/test`

**响应结果**:
```json
{
  "success": true,
  "data": {
    "connectionStatus": "SUCCESS",
    "responseTime": 150,
    "authStatus": "VALID",
    "testResult": {
      "endpoint": "/health",
      "statusCode": 200,
      "responseSize": 256
    },
    "diagnostics": {
      "dns_resolution": "OK",
      "ssl_certificate": "VALID", 
      "network_latency": 45
    }
  }
}
```

### 7.3 获取API数据

**接口地址**: `POST /api/soo/v2/api-data/fetch`

**请求参数**:
```json
{
  "interfaceId": 2001,
  "requestParams": {
    "department_id": "D001",
    "month": "2024-12",
    "include_benefits": true
  },
  "cacheConfig": {
    "useCache": true,
    "cacheTime": 3600,
    "forceRefresh": false
  }
}
```

**响应结果**:
```json
{
  "success": true,
  "data": {
    "requestId": "REQ_20241219_001",
    "fromCache": false,
    "responseTime": 450,
    "data": {
      "total_salary": 850000,
      "employee_count": 25,
      "average_salary": 34000,
      "benefits_cost": 170000
    },
    "metadata": {
      "source": "hr_system_api",
      "lastUpdated": "2024-12-19T11:45:00Z",
      "dataQuality": "HIGH"
    }
  }
}
```

## 8. 系统管理接口

### 8.1 获取系统状态

**接口地址**: `GET /api/soo/v2/system/status`

**响应结果**:
```json
{
  "success": true,
  "data": {
    "serviceStatus": "HEALTHY",
    "version": "2.0.0",
    "uptime": 86400,
    "systemResources": {
      "cpu_usage": 45.2,
      "memory_usage": 67.8,
      "disk_usage": 34.5,
      "active_connections": 25
    },
    "components": {
      "database": "HEALTHY",
      "redis": "HEALTHY", 
      "calculation_engine": "HEALTHY",
      "api_gateway": "HEALTHY"
    },
    "performance": {
      "average_response_time": 280,
      "requests_per_minute": 145,
      "error_rate": 0.002
    }
  }
}
```

### 8.2 获取性能指标

**接口地址**: `GET /api/soo/v2/system/metrics`

**查询参数**:
- `startTime`: 开始时间
- `endTime`: 结束时间  
- `metric`: 指标类型 (response_time, throughput, error_rate)
- `granularity`: 时间粒度 (minute, hour, day)

**响应结果**:
```json
{
  "success": true,
  "data": {
    "timeRange": {
      "start": "2024-12-19T10:00:00Z",
      "end": "2024-12-19T12:00:00Z",
      "granularity": "hour"
    },
    "metrics": {
      "response_time": [
        {"timestamp": "2024-12-19T10:00:00Z", "value": 250},
        {"timestamp": "2024-12-19T11:00:00Z", "value": 280},
        {"timestamp": "2024-12-19T12:00:00Z", "value": 265}
      ],
      "throughput": [
        {"timestamp": "2024-12-19T10:00:00Z", "value": 120},
        {"timestamp": "2024-12-19T11:00:00Z", "value": 145},
        {"timestamp": "2024-12-19T12:00:00Z", "value": 135}
      ]
    },
    "summary": {
      "avg_response_time": 265,
      "max_response_time": 850,
      "total_requests": 7200,
      "error_count": 12
    }
  }
}
```

## 9. 错误码说明

| 错误码 | 错误类型 | 描述 | 解决方案 |
|--------|----------|------|----------|
| 40001 | VALIDATION_ERROR | 参数验证失败 | 检查请求参数格式和必填项 |
| 40002 | FORMULA_SYNTAX_ERROR | 公式语法错误 | 检查计算公式语法 |
| 40003 | CIRCULAR_DEPENDENCY | 循环依赖 | 检查变量依赖关系 |
| 40401 | MODEL_NOT_FOUND | 模型不存在 | 确认模型ID是否正确 |
| 40402 | CALCULATION_NOT_FOUND | 计算实例不存在 | 确认计算实例ID是否正确 |
| 42201 | CALCULATION_TIMEOUT | 计算超时 | 简化计算模型或增加超时时间 |
| 42202 | API_CALL_FAILED | API调用失败 | 检查外部API状态和配置 |
| 50001 | INTERNAL_ERROR | 内部服务错误 | 联系技术支持 |
| 50301 | SERVICE_UNAVAILABLE | 服务不可用 | 稍后重试或联系运维 |

## 10. 调用示例

### 10.1 JavaScript/TypeScript示例

```typescript
// 安装依赖: npm install axios

import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://api.company.com/api/soo/v2',
  headers: {
    'Authorization': 'Bearer your-jwt-token',
    'Content-Type': 'application/json'
  }
});

// 创建财务模型
async function createFinancialModel() {
  try {
    const response = await apiClient.post('/models', {
      modelCode: 'profit_analysis_2024',
      modelName: '2024年利润分析模型',
      modelCategory: 'PROFIT_ANALYSIS',
      modelDescription: '用于分析公司2024年度利润情况'
    });
    
    console.log('模型创建成功:', response.data);
    return response.data.data.id;
  } catch (error) {
    console.error('模型创建失败:', error.response?.data);
    throw error;
  }
}

// 执行计算分析
async function performCalculation(modelId: number) {
  try {
    // 1. 创建计算实例
    const calcResponse = await apiClient.post('/calculations', {
      modelId: modelId,
      instanceName: '12月份利润分析',
      calculationPeriod: '2024-12',
      inputParameters: {
        total_revenue: 2000000,
        fixed_cost: 600000,
        variable_cost_rate: 0.4
      },
      calculationConfig: {
        autoExecute: true,
        includeScenarios: true
      }
    });
    
    const calculationId = calcResponse.data.data.id;
    console.log('计算实例创建成功:', calculationId);
    
    // 2. 等待计算完成
    let result;
    let attempts = 0;
    const maxAttempts = 30;
    
    do {
      await new Promise(resolve => setTimeout(resolve, 1000));
      result = await apiClient.get(`/calculations/${calculationId}`);
      attempts++;
    } while (result.data.data.status === 'PENDING' || result.data.data.status === 'CALCULATING' && attempts < maxAttempts);
    
    if (result.data.data.status === 'COMPLETED') {
      console.log('计算完成:', result.data.data.calculationResults);
      return result.data.data;
    } else {
      throw new Error('计算失败或超时');
    }
    
  } catch (error) {
    console.error('计算执行失败:', error.response?.data);
    throw error;
  }
}

// 执行场景分析
async function performScenarioAnalysis(calculationId: number) {
  try {
    const response = await apiClient.post('/scenarios/analyze', {
      baseCalculationId: calculationId,
      scenarios: [
        {
          scenarioCode: 'revenue_increase_20',
          scenarioName: '营业额增加20%',
          scenarioType: 'REVENUE',
          parameterAdjustments: {
            total_revenue: {type: 'MULTIPLY', value: 1.2}
          }
        },
        {
          scenarioCode: 'cost_optimize_10',
          scenarioName: '成本优化10%',
          scenarioType: 'COST',
          parameterAdjustments: {
            variable_cost_rate: {type: 'MULTIPLY', value: 0.9}
          }
        }
      ]
    });
    
    console.log('场景分析结果:', response.data.data);
    return response.data.data;
    
  } catch (error) {
    console.error('场景分析失败:', error.response?.data);
    throw error;
  }
}

// 使用示例
async function main() {
  try {
    const modelId = await createFinancialModel();
    const calculation = await performCalculation(modelId);
    const scenarioAnalysis = await performScenarioAnalysis(calculation.id);
    
    console.log('所有分析完成');
  } catch (error) {
    console.error('操作失败:', error);
  }
}

main();
```

### 10.2 Python示例

```python
import requests
import time
import json

class BreakevenAnalysisAPI:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def create_model(self, model_data):
        """创建财务模型"""
        response = requests.post(
            f'{self.base_url}/models',
            headers=self.headers,
            json=model_data
        )
        response.raise_for_status()
        return response.json()['data']
    
    def perform_calculation(self, calculation_data):
        """执行计算分析"""
        # 创建计算实例
        response = requests.post(
            f'{self.base_url}/calculations',
            headers=self.headers,
            json=calculation_data
        )
        response.raise_for_status()
        calculation_id = response.json()['data']['id']
        
        # 等待计算完成
        max_attempts = 30
        for attempt in range(max_attempts):
            time.sleep(1)
            result = requests.get(
                f'{self.base_url}/calculations/{calculation_id}',
                headers=self.headers
            )
            result.raise_for_status()
            
            status = result.json()['data']['status']
            if status == 'COMPLETED':
                return result.json()['data']
            elif status == 'FAILED':
                raise Exception(f"计算失败: {result.json()['data']['errorMessage']}")
        
        raise Exception("计算超时")
    
    def scenario_analysis(self, scenario_data):
        """场景分析"""
        response = requests.post(
            f'{self.base_url}/scenarios/analyze',
            headers=self.headers,
            json=scenario_data
        )
        response.raise_for_status()
        return response.json()['data']

# 使用示例
if __name__ == "__main__":
    api = BreakevenAnalysisAPI(
        base_url='https://api.company.com/api/soo/v2',
        token='your-jwt-token'
    )
    
    # 创建模型
    model = api.create_model({
        'modelCode': 'python_test_model',
        'modelName': 'Python测试模型',
        'modelCategory': 'TEST'
    })
    
    # 执行计算
    calculation = api.perform_calculation({
        'modelId': model['id'],
        'instanceName': 'Python测试计算',
        'inputParameters': {
            'total_revenue': 1000000,
            'fixed_cost': 400000,
            'variable_cost_rate': 0.3
        }
    })
    
    print(f"计算结果: {json.dumps(calculation, indent=2)}")
```

---

**文档版本**: v2.0  
**创建日期**: 2024-12-19  
**更新日期**: 2024-12-19  
**维护团队**: Portal 3.0 开发团队 