# 盈亏平衡分析模块 API 接口文档

## 1. 接口概览

### 1.1 基础信息
- **基础URL**: `/api/v1/breakeven-analysis`
- **认证方式**: Bearer Token
- **数据格式**: JSON
- **字符编码**: UTF-8

### 1.2 通用响应格式
```json
{
    "success": true,
    "data": {},
    "message": "操作成功",
    "timestamp": "2024-01-15T10:30:00Z",
    "traceId": "abc123def456"
}
```

### 1.3 错误响应格式
```json
{
    "success": false,
    "error": {
        "code": "INVALID_PARAMETER",
        "message": "参数验证失败",
        "details": {
            "field": "grossMargin",
            "reason": "值必须在0.05-0.8之间"
        }
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "traceId": "abc123def456"
}
```

## 2. 核心接口

### 2.1 创建盈亏平衡分析

**接口**: `POST /analysis`

**描述**: 创建新的盈亏平衡分析任务

**请求参数**:
```json
{
    "analysisName": "2024年Q1盈亏平衡分析",
    "analysisType": "monthly",
    "period": "2024-01",
    "parameters": {
        "currentTotalRevenue": 5000000,
        "currentGrossMargin": 0.35,
        "fixedOperatingCost": 800000,
        "variableOperatingCost": 200000,
        "totalEmployees": 150,
        "avgBaseSalary": 12000,
        "avgPerformanceRatio": 0.8
    },
    "scenarios": [
        {
            "name": "保守场景",
            "grossMargin": 0.1
        },
        {
            "name": "基准场景", 
            "grossMargin": 0.3
        },
        {
            "name": "乐观场景",
            "grossMargin": 0.65
        }
    ]
}
```

**响应示例**:
```json
{
    "success": true,
    "data": {
        "analysisId": "BEA_20240115_001",
        "results": {
            "breakevenPoint": 2850000,
            "totalFixedCost": 2000000,
            "variableCostRatio": 0.15,
            "marginSafety": 2150000,
            "marginSafetyRatio": 0.43,
            "scenarios": [
                {
                    "name": "保守场景",
                    "grossMargin": 0.1,
                    "breakevenPoint": 22222222,
                    "feasibilityScore": 0.2,
                    "riskLevel": "高"
                },
                {
                    "name": "基准场景",
                    "grossMargin": 0.3,
                    "breakevenPoint": 2850000,
                    "feasibilityScore": 0.75,
                    "riskLevel": "中"
                },
                {
                    "name": "乐观场景",
                    "grossMargin": 0.65,
                    "breakevenPoint": 1176470,
                    "feasibilityScore": 0.9,
                    "riskLevel": "低"
                }
            ]
        },
        "forecast": {
            "nextMonthRevenue": {
                "optimistic": 6000000,
                "baseline": 5200000,
                "pessimistic": 4500000
            },
            "confidenceLevel": 0.85,
            "keyDrivers": ["季节性因素", "市场趋势", "团队扩张"]
        },
        "createdAt": "2024-01-15T10:30:00Z"
    }
}
```

### 2.2 实时参数调整

**接口**: `PUT /analysis/{analysisId}/parameters`

**描述**: 实时调整分析参数并触发联动计算

**请求参数**:
```json
{
    "parameterName": "currentTotalRevenue",
    "newValue": 5500000,
    "triggerRecalculation": true,
    "cascadeLevel": "full"
}
```

**响应示例**:
```json
{
    "success": true,
    "data": {
        "parameterChange": {
            "parameter": "currentTotalRevenue",
            "originalValue": 5000000,
            "adjustedValue": 5500000,
            "adjustmentReason": null
        },
        "cascadeResults": {
            "affectedParameters": [
                "variableCostRatio",
                "marginSafety", 
                "marginSafetyRatio"
            ],
            "recalculatedValues": {
                "variableCostRatio": 0.13,
                "marginSafety": 2650000,
                "marginSafetyRatio": 0.48,
                "breakevenPoint": 2850000
            }
        },
        "newForecast": {
            "model": "exponentialSmoothing",
            "confidence": 0.87,
            "scenarios": {
                "optimistic": {
                    "revenue": 6600000,
                    "probability": 0.2
                },
                "baseline": {
                    "revenue": 5720000,
                    "probability": 0.6
                },
                "pessimistic": {
                    "revenue": 4950000,
                    "probability": 0.2
                }
            }
        },
        "calculationTime": 234
    }
}
```

### 2.3 敏感性分析

**接口**: `POST /analysis/{analysisId}/sensitivity`

**描述**: 执行敏感性分析，评估各参数对盈亏平衡点的影响

**请求参数**:
```json
{
    "sensitivityVariables": [
        "grossMargin",
        "fixedOperatingCost", 
        "avgBaseSalary",
        "totalEmployees"
    ],
    "changeRanges": [-0.2, -0.1, -0.05, 0.05, 0.1, 0.2],
    "analysisDepth": "detailed"
}
```

**响应示例**:
```json
{
    "success": true,
    "data": {
        "baselineBreakevenPoint": 2850000,
        "sensitivityResults": {
            "grossMargin": [
                {
                    "changeRate": -0.2,
                    "newBreakevenPoint": 4750000,
                    "impactRate": 0.67,
                    "feasibility": "低"
                },
                {
                    "changeRate": 0.1,
                    "newBreakevenPoint": 2280000,
                    "impactRate": -0.2,
                    "feasibility": "高"
                }
            ],
            "fixedOperatingCost": [
                {
                    "changeRate": 0.2,
                    "newBreakevenPoint": 3200000,
                    "impactRate": 0.12,
                    "feasibility": "中"
                }
            ]
        },
        "impactRanking": [
            {
                "parameter": "grossMargin",
                "sensitivity": 0.67,
                "priority": "高"
            },
            {
                "parameter": "fixedOperatingCost", 
                "sensitivity": 0.12,
                "priority": "中"
            }
        ],
        "recommendations": [
            "毛利率是最敏感的参数，建议重点关注产品定价策略",
            "固定成本控制对盈亏平衡点有中等影响，可考虑优化"
        ]
    }
}
```

### 2.4 批量场景对比

**接口**: `POST /analysis/{analysisId}/scenarios/batch`

**描述**: 批量执行多个场景的盈亏平衡分析并对比结果

**请求参数**:
```json
{
    "scenarios": [
        {
            "name": "人员扩张方案",
            "parameters": {
                "totalEmployees": 180,
                "avgBaseSalary": 13000,
                "fixedOperatingCost": 900000
            }
        },
        {
            "name": "成本优化方案",
            "parameters": {
                "fixedOperatingCost": 600000,
                "variableOperatingCost": 150000,
                "avgBaseSalary": 11000
            }
        },
        {
            "name": "高毛利策略",
            "parameters": {
                "currentGrossMargin": 0.5,
                "currentTotalRevenue": 4500000
            }
        }
    ],
    "comparisonMetrics": [
        "breakevenPoint",
        "marginSafety", 
        "feasibilityScore",
        "riskLevel"
    ]
}
```

**响应示例**:
```json
{
    "success": true,
    "data": {
        "scenarios": [
            {
                "name": "人员扩张方案",
                "results": {
                    "breakevenPoint": 3200000,
                    "marginSafety": 1800000,
                    "feasibilityScore": 0.7,
                    "riskLevel": "中",
                    "incrementalCost": 350000
                }
            },
            {
                "name": "成本优化方案", 
                "results": {
                    "breakevenPoint": 2100000,
                    "marginSafety": 2900000,
                    "feasibilityScore": 0.85,
                    "riskLevel": "低",
                    "costSaving": 450000
                }
            }
        ],
        "comparison": {
            "bestScenario": "成本优化方案",
            "riskiest": "人员扩张方案",
            "mostProfitable": "高毛利策略",
            "summary": {
                "breakevenRange": [2100000, 3200000],
                "avgFeasibility": 0.75,
                "recommendedStrategy": "成本优化方案"
            }
        },
        "recommendations": [
            "建议优先采用成本优化方案，风险最低且效果显著",
            "人员扩张需要谨慎评估，确保业务增长能够覆盖成本",
            "高毛利策略虽然利润可观，但需要评估市场接受度"
        ]
    }
}
```

### 2.5 预测模型重训练

**接口**: `POST /analysis/{analysisId}/forecast/retrain`

**描述**: 基于新参数重新训练预测模型

**请求参数**:
```json
{
    "changedParameters": [
        "totalEmployees",
        "avgBaseSalary"
    ],
    "trainingData": {
        "startDate": "2023-01-01",
        "endDate": "2024-01-01",
        "includeSeasonality": true
    },
    "modelType": "auto",
    "validationSplit": 0.2
}
```

**响应示例**:
```json
{
    "success": true,
    "data": {
        "retraining": {
            "modelSelected": "seasonalDecomposition",
            "trainingTime": 1230,
            "validationAccuracy": 0.89,
            "improvementOverPrevious": 0.06
        },
        "newForecast": {
            "nextQuarter": {
                "optimistic": 18000000,
                "baseline": 15600000,
                "pessimistic": 13500000,
                "confidence": 0.89
            },
            "seasonalFactors": {
                "Q1": 0.95,
                "Q2": 1.05,
                "Q3": 0.9,
                "Q4": 1.1
            },
            "keyInsights": [
                "检测到明显的季节性模式",
                "人员成本增长对盈亏平衡点影响显著",
                "建议在Q4旺季前完成人员扩张"
            ]
        },
        "modelMetadata": {
            "features": ["historicalRevenue", "employeeCount", "seasonality"],
            "hyperparameters": {
                "smoothingFactor": 0.3,
                "trendComponent": 0.1
            }
        }
    }
}
```

## 3. 查询接口

### 3.1 获取分析结果

**接口**: `GET /analysis/{analysisId}`

**描述**: 获取指定分析的完整结果

**查询参数**:
- `includeHistory`: 是否包含历史变更记录
- `includeForcast`: 是否包含预测数据
- `format`: 响应格式 (json/excel)

**响应示例**:
```json
{
    "success": true,
    "data": {
        "analysisInfo": {
            "analysisId": "BEA_20240115_001",
            "analysisName": "2024年Q1盈亏平衡分析",
            "analysisType": "monthly",
            "period": "2024-01",
            "status": "completed",
            "createdAt": "2024-01-15T10:30:00Z",
            "lastUpdated": "2024-01-15T14:22:00Z"
        },
        "currentResults": {
            "breakevenPoint": 2850000,
            "totalFixedCost": 2000000,
            "variableCostRatio": 0.15,
            "marginSafety": 2150000,
            "efficiencyMetrics": {
                "revenuePerEmployee": 33333,
                "costPerEmployee": 13333,
                "profitPerEmployee": 14333
            }
        },
        "changeHistory": [
            {
                "timestamp": "2024-01-15T12:15:00Z",
                "parameter": "totalEmployees",
                "oldValue": 150,
                "newValue": 160,
                "reason": "新员工入职",
                "impact": "盈亏平衡点增加5%"
            }
        ]
    }
}
```

### 3.2 获取参数变更日志

**接口**: `GET /analysis/{analysisId}/changelog`

**描述**: 获取参数变更的详细日志

**查询参数**:
- `startDate`: 开始日期
- `endDate`: 结束日期
- `parameter`: 特定参数名
- `page`: 页码
- `pageSize`: 每页数量

**响应示例**:
```json
{
    "success": true,
    "data": {
        "logs": [
            {
                "id": 1001,
                "timestamp": "2024-01-15T14:22:00Z",
                "parameter": "currentTotalRevenue",
                "oldValue": 5000000,
                "newValue": 5500000,
                "adjustedValue": 5500000,
                "adjustmentReason": null,
                "userId": "user_123",
                "userName": "张三",
                "impactScope": [
                    "variableCostRatio",
                    "marginSafety"
                ],
                "calculationTime": 234
            }
        ],
        "pagination": {
            "page": 1,
            "pageSize": 10,
            "total": 25,
            "totalPages": 3
        }
    }
}
```

### 3.3 获取预测趋势

**接口**: `GET /analysis/{analysisId}/forecast/trend`

**描述**: 获取历史预测趋势和准确度分析

**查询参数**:
- `period`: 预测周期 (monthly/quarterly)
- `horizon`: 预测范围 (月数)

**响应示例**:
```json
{
    "success": true,
    "data": {
        "trendAnalysis": {
            "direction": "上升",
            "strength": "中等",
            "seasonality": {
                "detected": true,
                "pattern": "年度周期",
                "peakMonths": [11, 12, 1]
            }
        },
        "historicalAccuracy": {
            "oneMonthAhead": 0.89,
            "threeMonthsAhead": 0.76,
            "sixMonthsAhead": 0.62,
            "avgError": 0.12
        },
        "futureProjections": [
            {
                "period": "2024-02",
                "predictedRevenue": 5200000,
                "predictedBreakeven": 2850000,
                "confidenceInterval": {
                    "lower": 4800000,
                    "upper": 5600000
                }
            }
        ]
    }
}
```

## 4. 管理接口

### 4.1 分析列表查询

**接口**: `GET /analysis`

**描述**: 获取分析任务列表

**查询参数**:
- `status`: 状态筛选 (active/completed/archived)
- `type`: 分析类型
- `startDate`: 创建日期范围
- `endDate`: 创建日期范围
- `search`: 关键词搜索

**响应示例**:
```json
{
    "success": true,
    "data": {
        "analyses": [
            {
                "analysisId": "BEA_20240115_001",
                "analysisName": "2024年Q1盈亏平衡分析",
                "analysisType": "monthly",
                "status": "active",
                "createdAt": "2024-01-15T10:30:00Z",
                "lastCalculation": "2024-01-15T14:22:00Z",
                "breakevenPoint": 2850000,
                "riskLevel": "中"
            }
        ],
        "pagination": {
            "page": 1,
            "pageSize": 20,
            "total": 45,
            "totalPages": 3
        }
    }
}
```

### 4.2 删除分析

**接口**: `DELETE /analysis/{analysisId}`

**描述**: 删除指定的分析任务

**响应示例**:
```json
{
    "success": true,
    "message": "分析任务已删除",
    "data": {
        "deletedAnalysisId": "BEA_20240115_001",
        "deletedAt": "2024-01-15T16:00:00Z"
    }
}
```

### 4.3 分析配置管理

**接口**: `PUT /analysis/{analysisId}/config`

**描述**: 更新分析的配置参数

**请求参数**:
```json
{
    "autoRecalculation": true,
    "recalculationTriggers": [
        "parameter_change",
        "data_update",
        "scheduled"
    ],
    "alertSettings": {
        "breakevenPointChange": {
            "enabled": true,
            "threshold": 0.1
        },
        "riskLevelChange": {
            "enabled": true,
            "notifications": ["email", "system"]
        }
    },
    "forecastSettings": {
        "autoRetrain": true,
        "retrainInterval": "weekly",
        "confidenceThreshold": 0.8
    }
}
```

## 5. 实时更新接口

### 5.1 WebSocket连接

**连接地址**: `ws://api.domain.com/v1/breakeven-analysis/ws`

**描述**: 建立WebSocket连接以接收实时计算结果更新

**连接参数**:
```json
{
    "token": "Bearer eyJhbGciOiJIUzI1NiIs...",
    "analysisId": "BEA_20240115_001",
    "subscriptions": [
        "parameter_changes",
        "calculation_results", 
        "alerts"
    ]
}
```

**消息格式**:
```json
{
    "type": "calculation_complete",
    "analysisId": "BEA_20240115_001",
    "timestamp": "2024-01-15T14:22:30Z",
    "data": {
        "changedParameter": "totalEmployees",
        "newBreakevenPoint": 2950000,
        "impact": "上升3.5%",
        "cascadeEffects": [
            "fixedCostIncrease",
            "marginSafetyDecrease"
        ]
    }
}
```

### 5.2 服务器推送事件 (SSE)

**接口**: `GET /analysis/{analysisId}/events`

**描述**: 建立SSE连接接收实时事件流

**事件类型**:
- `calculation-update`: 计算结果更新
- `parameter-change`: 参数变化
- `forecast-update`: 预测更新
- `alert`: 风险预警

## 6. 错误码说明

| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| `INVALID_PARAMETER` | 参数验证失败 | 检查参数格式和范围 |
| `CALCULATION_TIMEOUT` | 计算超时 | 简化参数或稍后重试 |
| `INSUFFICIENT_DATA` | 数据不足 | 补充必要的历史数据 |
| `MODEL_TRAINING_FAILED` | 模型训练失败 | 检查训练数据质量 |
| `ANALYSIS_NOT_FOUND` | 分析不存在 | 确认分析ID正确性 |
| `PERMISSION_DENIED` | 权限不足 | 联系管理员获取权限 |
| `RATE_LIMIT_EXCEEDED` | 请求频率超限 | 降低请求频率 |
| `SYSTEM_OVERLOAD` | 系统过载 | 稍后重试 |

## 7. SDK使用示例

### 7.1 JavaScript SDK

```javascript
import { BreakevenAnalysisClient } from '@company/breakeven-sdk';

const client = new BreakevenAnalysisClient({
    baseUrl: 'https://api.company.com/v1/breakeven-analysis',
    token: 'your-auth-token'
});

// 创建分析
const analysis = await client.createAnalysis({
    analysisName: '测试分析',
    parameters: {
        currentTotalRevenue: 5000000,
        currentGrossMargin: 0.35
    }
});

// 实时参数调整
client.on('parameterChange', (analysisId, parameter, value) => {
    console.log(`参数 ${parameter} 变更为 ${value}`);
});

await client.updateParameter(analysis.analysisId, 'currentTotalRevenue', 5500000);

// 获取结果
const results = await client.getResults(analysis.analysisId);
```

### 7.2 Python SDK

```python
from breakeven_client import BreakevenAnalysisClient

client = BreakevenAnalysisClient(
    base_url='https://api.company.com/v1/breakeven-analysis',
    token='your-auth-token'
)

# 创建分析
analysis = client.create_analysis(
    analysis_name='测试分析',
    parameters={
        'currentTotalRevenue': 5000000,
        'currentGrossMargin': 0.35
    }
)

# 敏感性分析
sensitivity = client.sensitivity_analysis(
    analysis.analysis_id,
    variables=['grossMargin', 'fixedOperatingCost'],
    change_ranges=[-0.1, 0.1, 0.2]
)

print(f"毛利率敏感性: {sensitivity['grossMargin']['sensitivity']}")
```

## 8. 性能指标

### 8.1 响应时间要求

| 接口类型 | 目标响应时间 | 最大响应时间 |
|----------|-------------|-------------|
| 参数调整 | < 500ms | < 2s |
| 基础查询 | < 200ms | < 1s |
| 复杂计算 | < 2s | < 10s |
| 批量分析 | < 5s | < 30s |
| 模型训练 | < 10s | < 60s |

### 8.2 并发能力

- 单实例并发: 1000 requests/second
- 集群并发: 10000 requests/second
- WebSocket连接: 5000 concurrent connections

### 8.3 数据限制

- 单次分析最大参数数量: 100
- 历史数据最大范围: 5年
- 场景对比最大数量: 50
- 敏感性分析最大变量数: 20 