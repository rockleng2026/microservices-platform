import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  Form,
  Button,
  InputNumber,
  Select,
  message,
  Divider,
  Space,
  Popconfirm,
  Radio,
  Card,
  Statistic,
  Row,
  Col,
  Typography,
  Table,
} from 'antd';
import { PlusOutlined, DeleteOutlined, DollarOutlined, PercentageOutlined, BankOutlined, UserOutlined } from '@ant-design/icons';
import { projectApi } from '@/services/project';
import { getEmployeeDetail } from '@/services/organization/employee';
import { getDepartmentDetail, batchGetEmployeeMainDepartments } from '@/services/organization/department';
import type { Project } from '@/types/project';

const { Text } = Typography;

interface EmployeeDistribution {
  key: string;
  employeeId: string;
  employeeName: string;
  weight: number;
  amount: number;
  isFixedAmount: boolean; // true: 固定金额, false: 按比例
}

interface DepartmentAllocation {
  key: string;
  departmentId: string;
  departmentName: string;
  weight: number; // 部门权重（占总提成的百分比）
  totalAmount: number; // 部门总金额
  reserveRatio: number; // 储备金比例，默认20%
  employeeDistributions: EmployeeDistribution[]; // 员工分配列表
  expanded?: boolean; // 是否展开显示员工
}

type DistributionMode = 'ratio' | 'fixed'; // ratio: 按比例, fixed: 固定金额

interface ProfitDistributionModalProps {
  visible: boolean;
  project: Project | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const ProfitDistributionModal: React.FC<ProfitDistributionModalProps> = ({
  visible,
  project,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [distributionMode, setDistributionMode] = useState<DistributionMode>('ratio');
  
  // 项目基础数据
  const [projectActualAmount, setProjectActualAmount] = useState(0); // 项目实际金额
  const [grossProfit, setGrossProfit] = useState(0); // 毛利润
  const [grossProfitRate, setGrossProfitRate] = useState(0); // 毛利率
  
  // 提成分配设置
  const [maxDistributionRatio, setMaxDistributionRatio] = useState(50); // 最大分配比例，默认50%
  const [maxDistributionAmount, setMaxDistributionAmount] = useState(0); // 最大提成金额
  
  const [departmentAllocations, setDepartmentAllocations] = useState<DepartmentAllocation[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<Array<{label: string, value: string, name: string}>>([]);
  const [employeeDepartmentMap, setEmployeeDepartmentMap] = useState<Map<string, {id: string, name: string}>>(new Map());
  const [projectDetailData, setProjectDetailData] = useState<any>(null);

  // 新增：标识是否有已保存的分配数据
  const [hasExistingData, setHasExistingData] = useState(false);

  useEffect(() => {
    if (visible && project) {
      form.resetFields();
      setDepartmentAllocations([]);
      setHasExistingData(false);
      loadInitData();
    }
  }, [visible, project]);
  
  // 加载初始化数据
  const loadInitData = async () => {
    if (!project?.id) return;
    
    try {
      setLoading(true);
      console.log('开始加载项目提成分配初始化数据, 项目ID:', project.id);
      
      const response = await projectApi.getProfitDistributionInitData(project.id);
      console.log('获取初始化数据响应:', response);
      
      if (response.resp_code === 0 && response.datas) {
        const initData = response.datas;
        console.log('初始化数据内容:', initData);
        
        // 设置项目结项数据
        if (initData.closure) {
          console.log('找到结项数据，设置项目金额信息...');
          setProjectActualAmount(initData.closure.actualAmount || 0);
          setGrossProfit(initData.closure.grossProfit || 0);
          
          // 计算毛利率
          if (initData.closure.actualAmount && initData.closure.actualAmount > 0) {
            const rate = (initData.closure.grossProfit / initData.closure.actualAmount) * 100;
            setGrossProfitRate(rate);
          }
        } else if (initData.actualAmount && initData.grossProfit) {
          console.log('从返回数据设置项目金额信息...');
          // 从返回的计算值设置
          setProjectActualAmount(initData.actualAmount);
          setGrossProfit(initData.grossProfit);
          if (initData.grossProfitRate) {
            setGrossProfitRate(initData.grossProfitRate * 100); // 转换为百分比
          }
        } else {
          console.log('没有找到项目金额信息，使用默认值');
          initializeProjectData();
        }
        
        // 设置最大分配比例（从项目中获取，如果有的话）
        if (initData.project?.maxDistribution) {
          setMaxDistributionRatio(initData.project.maxDistribution * 100); // 转换为百分比
          console.log('设置最大分配比例:', initData.project.maxDistribution * 100, '%');
        }
        
        // 判断是否有已保存的提成分配数据
        const hasData = initData.hasExistingData && 
                       initData.hierarchicalData && 
                       initData.hierarchicalData.departments &&
                       initData.hierarchicalData.departments.length > 0;
        
        console.log('是否有已保存数据判断:', {
          hasExistingData: initData.hasExistingData,
          hasHierarchicalData: !!initData.hierarchicalData,
          departmentsCount: initData.hierarchicalData?.departments?.length || 0,
          finalResult: hasData
        });

        setHasExistingData(hasData);
        
        if (hasData) {
          console.log('*** 场景1：编辑已有分配数据 ***');
          await loadExistingDistributionData(initData.hierarchicalData);
        } else {
          console.log('*** 场景2：第一次分配，按原逻辑处理 ***');
          await extractDepartmentsFromProject();
        }
        
      } else {
        console.warn('获取初始化数据失败或无数据，使用备用逻辑:', response.resp_msg || '无响应数据');
        // 失败时使用原逻辑
        console.log('执行备用初始化逻辑...');
        initializeProjectData();
        await extractDepartmentsFromProject();
      }
    } catch (error) {
      console.error('加载初始化数据失败:', error);
      message.error('加载初始化数据失败');
      // 失败时使用原逻辑
      console.log('异常情况，执行备用初始化逻辑...');
      initializeProjectData();
      await extractDepartmentsFromProject();
    } finally {
      setLoading(false);
      console.log('初始化数据加载完成，场景:', hasExistingData ? '编辑已有数据' : '第一次分配');
    }
  };
  
  // 加载已保存的提成分配数据
  const loadExistingDistributionData = async (hierarchicalData: any) => {
    try {
      console.log('加载已保存的提成分配数据...', hierarchicalData);
      
      // 设置部门和员工数据
      if (hierarchicalData.departments && hierarchicalData.departments.length > 0) {
        
        // 收集所有需要查询的部门ID和员工ID
        const departmentIds = new Set<string>();
        const employeeIds = new Set<string>();
        
        hierarchicalData.departments.forEach((dept: any) => {
          if (dept.departmentId) {
            departmentIds.add(String(dept.departmentId));
          }
          if (dept.employees) {
            dept.employees.forEach((emp: any) => {
              if (emp.employeeId) {
                employeeIds.add(String(emp.employeeId));
              }
            });
          }
        });

        // 并行获取部门名称和员工姓名
        const [departmentNames, employeeNames] = await Promise.all([
          // 获取部门名称
          Promise.all(
            Array.from(departmentIds).map(async (deptId) => {
              try {
                const deptRes = await getDepartmentDetail(deptId);
                console.log(`📡 编辑模式-部门${deptId}详情API响应:`, deptRes);
                
                // 适配两种可能的响应格式
                let departmentName = `部门${deptId}`;
                if (deptRes && deptRes.resp_code === 0 && deptRes.datas && deptRes.datas.name) {
                  // 格式1: {resp_code: 0, datas: {...}}
                  departmentName = deptRes.datas.name;
                } else if (deptRes && deptRes.success && deptRes.data && deptRes.data.name) {
                  // 格式2: {success: true, data: {...}}
                  departmentName = deptRes.data.name;
                }
                
                console.log(`✅ 编辑模式-获取部门${deptId}名称成功:`, departmentName);
                return { id: deptId, name: departmentName };
              } catch (error) {
                console.error(`获取部门${deptId}名称失败:`, error);
                return { id: deptId, name: `部门${deptId}` };
              }
            })
          ),
          // 获取员工姓名
          Promise.all(
            Array.from(employeeIds).map(async (empId) => {
              try {
                const empRes = await getEmployeeDetail(Number(empId));
                console.log(`📡 编辑模式-员工${empId}详情API响应:`, empRes);
                
                // 适配两种可能的响应格式
                let employeeName = `员工${empId}`;
                if (empRes && empRes.resp_code === 0 && empRes.datas && empRes.datas.name) {
                  // 格式1: {resp_code: 0, datas: {...}}
                  employeeName = empRes.datas.name;
                } else if (empRes && empRes.success && empRes.data && empRes.data.name) {
                  // 格式2: {success: true, data: {...}}
                  employeeName = empRes.data.name;
                }
                
                console.log(`✅ 编辑模式-获取员工${empId}姓名成功:`, employeeName);
                return { id: empId, name: employeeName };
              } catch (error) {
                console.error(`获取员工${empId}姓名失败:`, error);
                return { id: empId, name: `员工${empId}` };
              }
            })
          )
        ]);

        // 创建名称映射
        const deptNameMap = new Map(departmentNames.map(d => [d.id, d.name]));
        const empNameMap = new Map(employeeNames.map(e => [e.id, e.name]));

        // 创建部门选项
        const departmentOptions = departmentNames.map(dept => ({
          label: dept.name,
          value: dept.id,
          name: dept.name
        }));
        setAvailableDepartments(departmentOptions);

        const departmentData: DepartmentAllocation[] = hierarchicalData.departments.map((dept: any) => ({
          key: `dept_${dept.departmentId}`,
          departmentId: String(dept.departmentId),
          departmentName: deptNameMap.get(String(dept.departmentId)) || `部门${dept.departmentId}`,
          weight: Number(dept.weight) || 0,
          totalAmount: Number(dept.amount) || 0,
          reserveRatio: 20, // 默认储备金比例
          employeeDistributions: dept.employees?.map((emp: any) => ({
            key: `emp_${dept.departmentId}_${emp.employeeId}`,
            employeeId: String(emp.employeeId),
            employeeName: empNameMap.get(String(emp.employeeId)) || `员工${emp.employeeId}`,
            weight: emp.distributionType === '比例' ? Number(emp.distributionValue) : 0,
            amount: emp.distributionType === '金额' ? Number(emp.distributionValue) : 0,
            isFixedAmount: emp.distributionType === '金额',
          })) || [],
          expanded: true,
        }));
        
        setDepartmentAllocations(departmentData);
        console.log('成功加载已保存的提成分配数据:', departmentData);
        
        // 手动触发一次金额计算
        setTimeout(() => {
          console.log('🔄 编辑模式数据加载完成，手动触发金额计算');
          calculateAmountsWithData(departmentData);
        }, 100);
        
        message.success('已加载保存的提成分配数据');
      }
    } catch (error) {
      console.error('加载已保存数据失败:', error);
      message.error('加载已保存数据失败');
    }
  };

  // 初始化项目数据
  const initializeProjectData = () => {
    if (!project) return;

    // 假设项目有这些字段，实际需要根据Project类型调整
    const actualAmount = (project as any).actualAmount || (project as any).totalAmount || 100000;
    const projectGrossProfit = (project as any).grossProfit || actualAmount * 0.3; // 假设30%毛利率
    
    console.log('📊 初始化项目数据:', {
      project,
      actualAmount,
      projectGrossProfit,
      maxDistributionRatio
    });
    
    setProjectActualAmount(actualAmount);
    setGrossProfit(projectGrossProfit);
    
    // 计算毛利率
    const profitRate = actualAmount > 0 ? (projectGrossProfit / actualAmount) * 100 : 0;
    setGrossProfitRate(profitRate);
    
    // 设置最大提成金额
    const maxAmount = (projectGrossProfit * maxDistributionRatio) / 100;
    setMaxDistributionAmount(maxAmount);
    
    console.log('📊 项目数据初始化完成:', {
      actualAmount,
      projectGrossProfit,
      profitRate,
      maxDistributionRatio,
      maxAmount
    });
  };

  // 动态计算关联数据
  useEffect(() => {
    // 毛利率 = 毛利润 / 项目实际金额
    if (projectActualAmount > 0) {
      const profitRate = (grossProfit / projectActualAmount) * 100;
      setGrossProfitRate(profitRate);
    }
  }, [grossProfit, projectActualAmount]);

  useEffect(() => {
    // 最大提成金额 = 毛利润 * 最大分配比例
    const maxAmount = (grossProfit * maxDistributionRatio) / 100;
    setMaxDistributionAmount(maxAmount);
  }, [grossProfit, maxDistributionRatio]);

  // 从项目参与人中提取部门信息
  const extractDepartmentsFromProject = async () => {
    if (!project) {
      return;
    }

    console.log('开始提取项目部门信息（第一次分配场景）...');
    setLoading(true);

    try {
      // 第一步：获取项目完整详情（包含参与人信息）
      console.log('获取项目详情...');
      const projectDetailResponse = await projectApi.getProjectById(project.id);
      
      if (projectDetailResponse.resp_code !== 0 || !projectDetailResponse.datas) {
        throw new Error('获取项目详情失败');
      }

      const projectDetail = projectDetailResponse.datas;
      console.log('项目详情:', projectDetail);

      // 第二步：收集所有员工ID（去重）
      const employeeIdSet = new Set<string>();
      
      // 添加项目负责人
      if (projectDetail.leaderId) {
        employeeIdSet.add(String(projectDetail.leaderId));
      }
      
      // 添加项目参与人
      if (projectDetail.participantDetails && projectDetail.participantDetails.length > 0) {
        projectDetail.participantDetails.forEach(participant => {
          if (participant.participantId) {
            employeeIdSet.add(String(participant.participantId));
          }
        });
      }

      const employeeIds = Array.from(employeeIdSet);
      console.log('需要查询的员工ID:', employeeIds);

      if (employeeIds.length === 0) {
        throw new Error('未找到项目参与人员');
      }

      // 第三步：批量查询员工所属大部门
      console.log('批量查询员工所属大部门...');
      const batchResponse = await batchGetEmployeeMainDepartments(employeeIds);
      
      if (!batchResponse || batchResponse.resp_code !== 0 || !batchResponse.datas) {
        throw new Error('批量查询员工大部门失败');
      }

      const batchResult = batchResponse.datas;
      console.log('批量查询结果:', batchResult);

      const employeeDepartmentMap = new Map<string, {id: string, name: string}>();
      const departmentOptions: Array<{label: string, value: string, name: string}> = [];

      // 处理查询结果
      if (batchResult.employeeDepartmentMap) {
        Object.entries(batchResult.employeeDepartmentMap).forEach(([empId, deptInfo]: [string, any]) => {
          employeeDepartmentMap.set(empId, {
            id: deptInfo.id,
            name: deptInfo.name
          });
        });
      }

      if (batchResult.departments) {
        batchResult.departments.forEach((dept: any) => {
          departmentOptions.push({
            label: dept.name,
            value: dept.id,
            name: dept.name
          });
        });
      }

      console.log('员工与大部门映射关系:', employeeDepartmentMap);
      console.log('大部门选项:', departmentOptions);

      if (departmentOptions.length === 0) {
        throw new Error('未找到任何有效的大部门信息');
      }

      // 第四步：获取员工详情（逐个查询）
      console.log('获取员工详情...');
      const employeeDetailsMap = new Map<string, any>();
      
      for (const empId of employeeIds) {
        try {
          const empResponse = await getEmployeeDetail(Number(empId));
          console.log(`📡 员工${empId}详情API响应:`, empResponse);
          
          // 适配两种可能的响应格式
          let employeeData = null;
          if (empResponse && empResponse.resp_code === 0 && empResponse.datas) {
            // 格式1: {resp_code: 0, datas: {...}}
            employeeData = empResponse.datas;
          } else if (empResponse && empResponse.success && empResponse.data) {
            // 格式2: {success: true, data: {...}}
            employeeData = empResponse.data;
          }
          
          if (employeeData) {
            employeeDetailsMap.set(empId, employeeData);
            console.log(`✅ 获取员工${empId}详情成功:`, employeeData.name);
          } else {
            console.warn(`⚠️  获取员工${empId}详情失败:`, empResponse);
          }
        } catch (error) {
          console.warn(`❌ 获取员工${empId}详情异常:`, error);
        }
      }

      console.log('📝 员工详情映射表:', employeeDetailsMap);

      // 第五步：设置数据并初始化分配
      setAvailableDepartments(departmentOptions);
      setEmployeeDepartmentMap(employeeDepartmentMap);
      setProjectDetailData(projectDetail);

      // 初始化部门分配，包含员工信息
      const initialAllocations = await initializeDepartmentAllocations(
        departmentOptions, 
        employeeDepartmentMap, 
        employeeDetailsMap, 
        projectDetail
      );

      console.log('🎯 初始化部门分配完成:', initialAllocations);
      
      // 确保所有部门都展开，显示员工
      const expandedAllocations = initialAllocations.map(dept => ({
        ...dept,
        expanded: true // 强制展开显示员工
      }));
      
      console.log('🔄 设置部门分配数据:', expandedAllocations);
      setDepartmentAllocations(expandedAllocations);
      
      // 手动触发一次金额计算
      setTimeout(() => {
        console.log('🔄 新建模式数据加载完成，手动触发金额计算');
        calculateAmountsWithData(expandedAllocations);
      }, 200);
      
      // 一次性调试输出，检查最终结果
      setTimeout(() => {
        console.log('🎯 最终部门分配结果检查:');
        expandedAllocations.forEach((dept, index) => {
          console.log(`📂 部门${index + 1}: ${dept.departmentName} (${dept.departmentId})`);
          console.log(`   展开状态: ${dept.expanded}`);
          console.log(`   员工数量: ${dept.employeeDistributions.length}`);
          dept.employeeDistributions.forEach((emp, empIndex) => {
            console.log(`   👤 员工${empIndex + 1}: ${emp.employeeName} (${emp.employeeId})`);
          });
        });
      }, 100);
      
      message.success(`成功识别到${departmentOptions.length}个参与部门`);

    } catch (error) {
      console.error('提取部门信息失败:', error);
      message.error('提取部门信息失败: ' + (error instanceof Error ? error.message : String(error)));
      
      // 容错：如果所有逻辑都失败，至少提供一个基本的分配模板
      console.log('所有提取逻辑失败，创建基本分配模板...');
      const fallbackAllocation: DepartmentAllocation = {
        key: 'dept_fallback',
        departmentId: '',
        departmentName: '',
        weight: 100,
        totalAmount: 0,
        reserveRatio: 20,
        employeeDistributions: [],
        expanded: true
      };
      setDepartmentAllocations([fallbackAllocation]);
      message.warning('无法自动识别项目部门，请手动添加分配方案');
    } finally {
      setLoading(false);
    }
  };

  // 初始化部门分配数据
  const initializeDepartmentAllocations = async (
    departments: Array<{label: string, value: string, name: string}>,
    empDeptMap: Map<string, {id: string, name: string}>,
    employeeDetailsMap: Map<string, any>,
    projectDetail: any
  ): Promise<DepartmentAllocation[]> => {
    
    console.log('🔧 开始初始化部门分配数据...');
    console.log('📋 部门列表:', departments);
    console.log('👥 员工部门映射:', empDeptMap);
    console.log('📝 员工详情映射表:', employeeDetailsMap);
    
    // 按部门分组员工
    const departmentEmployeesMap = new Map<string, Array<{id: string, name: string}>>();
    
    // 初始化部门员工列表
    departments.forEach(dept => {
      departmentEmployeesMap.set(dept.value, []);
    });

    // 分配员工到对应部门
    empDeptMap.forEach((deptInfo, empId) => {
      // empId已经是字符串类型，直接使用
      const employee = employeeDetailsMap.get(empId);
      
      console.log(`🔍 查找员工 ${empId}:`, {
        employee,
        deptInfo,
        hasEmployee: !!employee,
        hasDepartment: departmentEmployeesMap.has(deptInfo.id),
        employeeMapKeys: Array.from(employeeDetailsMap.keys()),
        deptMapKeys: Array.from(departmentEmployeesMap.keys())
      });
      
      if (employee && departmentEmployeesMap.has(deptInfo.id)) {
        departmentEmployeesMap.get(deptInfo.id)!.push({
          id: empId,
          name: employee.name
        });
        console.log(`✅ 分配员工 ${employee.name} (${empId}) 到部门 ${deptInfo.name} (${deptInfo.id})`);
      } else {
        console.warn(`⚠️  无法分配员工 ${empId}:`, {
          hasEmployee: !!employee,
          hasDepartment: departmentEmployeesMap.has(deptInfo.id),
          deptInfo,
          employeeData: employee
        });
      }
    });

    console.log('🏢 部门员工分组结果:', departmentEmployeesMap);

    // 创建部门分配数据
    const averageWeight = Math.floor(100 / departments.length); // 总共100%分配给各部门
    const remainder = 100 - (averageWeight * departments.length);
    
    const result = departments.map((dept, index) => {
      const employees = departmentEmployeesMap.get(dept.value) || [];
      const departmentWeight = index === 0 ? averageWeight + remainder : averageWeight;
      
      console.log(`处理部门 ${dept.name} (${dept.value})，员工数量: ${employees.length}`, employees);
      
      // 为每个员工初始化权重（平均分配给员工）
      const employeeCount = employees.length;
      
      // 优化权重分配逻辑：
      // 1. 部门权重的70%分配给员工，30%作为储备金
      // 2. 员工权重平均分配，确保总和不超过分配给员工的权重
      const employeeAllocableWeight = departmentWeight * 0.7; // 70%给员工
      const avgEmployeeWeight = employeeCount > 0 ? employeeAllocableWeight / employeeCount : 0;
      
      console.log(`部门 ${dept.name} 权重分配:`, {
        departmentWeight,
        employeeAllocableWeight,
        employeeCount,
        avgEmployeeWeight
      });
      
      const employeeDistributions: EmployeeDistribution[] = employees.map((emp) => ({
        key: `emp_${dept.value}_${emp.id}`,
        employeeId: emp.id,
        employeeName: emp.name,
        weight: Number(avgEmployeeWeight.toFixed(2)),
        amount: 0,
        isFixedAmount: false
      }));

      console.log(`部门 ${dept.name} 的员工分配:`, employeeDistributions);

      return {
        key: `dept_${dept.value}`,
        departmentId: dept.value,
        departmentName: dept.name,
        weight: departmentWeight,
        totalAmount: 0,
        reserveRatio: 20, // 默认20%储备金（现在是动态计算的）
        employeeDistributions,
        expanded: true // 确保默认展开
      };
    });

    console.log('最终初始化结果:', result);
    return result;
  };

  // 计算金额 - 根据权重动态分配
  const calculateAmounts = () => {
    console.log('🧮 开始计算金额分配:', {
      grossProfit,
      maxDistributionRatio,
      departmentAllocationsLength: departmentAllocations.length
    });
    
    if (departmentAllocations.length === 0) {
      console.log('⚠️ 部门分配数据为空，跳过计算');
      return;
    }
    
    const updatedAllocations = departmentAllocations.map(dept => {
      // 1. 计算部门分配金额 = 毛利润 * 最大分配比例 * 部门权重比例
      // 例如：毛利润10万 * 最大分配比例50% * 技术部权重20% = 1万
      const deptAmount = (grossProfit * maxDistributionRatio / 100) * (dept.weight / 100);
      
      console.log(`💰 计算部门 ${dept.departmentName} 分配:`, {
        grossProfit,
        maxDistributionRatio,
        deptWeight: dept.weight,
        deptAmount
      });
      
      // 2. 计算员工分配金额 - 基于最大分配比例作为基准
      const updatedEmployees = dept.employeeDistributions.map(emp => {
        if (emp.isFixedAmount) {
          // 固定金额员工保持原金额
          return { ...emp };
        } else {
          // 按权重分配的员工：毛利润 * 最大分配比例 * 员工权重比例
          // 例如：毛利润10万 * 最大分配比例50% * 员工权重5% = 2500元
          const amount = (grossProfit * maxDistributionRatio / 100) * (emp.weight / 100);
          console.log(`👤 计算员工 ${emp.employeeName} 分配:`, {
            empWeight: emp.weight,
            amount
          });
          return { ...emp, amount: Math.max(0, amount) };
        }
      });

      return {
        ...dept,
        totalAmount: deptAmount,
        employeeDistributions: updatedEmployees
      };
    });

    console.log('✅ 计算完成，更新分配数据:', updatedAllocations);
    setDepartmentAllocations(updatedAllocations);
  };

  // 专门用于初始化后计算的函数
  const calculateAmountsWithData = (allocations: DepartmentAllocation[]) => {
    console.log('🧮 初始化后计算金额分配:', {
      grossProfit,
      maxDistributionRatio,
      allocationsLength: allocations.length
    });
    
    const updatedAllocations = allocations.map(dept => {
      const deptAmount = (grossProfit * maxDistributionRatio / 100) * (dept.weight / 100);
      
      const updatedEmployees = dept.employeeDistributions.map(emp => {
        if (emp.isFixedAmount) {
          return { ...emp };
        } else {
          const amount = (grossProfit * maxDistributionRatio / 100) * (emp.weight / 100);
          return { ...emp, amount: Math.max(0, amount) };
        }
      });

      return {
        ...dept,
        totalAmount: deptAmount,
        employeeDistributions: updatedEmployees
      };
    });

    console.log('✅ 初始化计算完成，设置分配数据:', updatedAllocations);
    setDepartmentAllocations(updatedAllocations);
  };

  // 监听相关数据变化，触发重新计算
  useEffect(() => {
    if (departmentAllocations.length > 0) {
      console.log('🔄 触发重新计算 (grossProfit/maxDistributionRatio变化)');
      calculateAmounts();
    }
  }, [grossProfit, maxDistributionRatio]);

  // 监听部门权重变化，也需要重新计算
  useEffect(() => {
    if (departmentAllocations.length > 0 && grossProfit > 0) {
      console.log('🔄 触发重新计算 (departmentAllocations变化)');
      // 使用防抖，避免频繁计算
      const timeoutId = setTimeout(() => {
        calculateAmounts();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [departmentAllocations.map(d => d.weight).join(','), departmentAllocations.map(d => d.employeeDistributions.map(e => `${e.weight}-${e.amount}`).join(',')).join(';')]);

  // 更新部门信息
  const updateDepartment = (key: string, field: string, value: any) => {
    const updatedAllocations = departmentAllocations.map(dept => {
      if (dept.key === key) {
        return { ...dept, [field]: value };
      }
      return dept;
    });
    setDepartmentAllocations(updatedAllocations);
  };

  // 更新员工信息
  const updateEmployee = (deptKey: string, empKey: string, field: string, value: any) => {
    const updatedAllocations = departmentAllocations.map(dept => {
      if (dept.key === deptKey) {
        const updatedEmployees = dept.employeeDistributions.map(emp => {
          if (emp.key === empKey) {
            return { ...emp, [field]: value };
          }
          return emp;
        });
        return { ...dept, employeeDistributions: updatedEmployees };
      }
      return dept;
    });
    setDepartmentAllocations(updatedAllocations);
  };

  // 添加部门
  const addDepartment = () => {
    const newDept: DepartmentAllocation = {
      key: `dept_new_${Date.now()}`,
      departmentId: '',
      departmentName: '',
      weight: 0,
      totalAmount: 0,
      reserveRatio: 20,
      employeeDistributions: [],
      expanded: true
    };
    setDepartmentAllocations([...departmentAllocations, newDept]);
  };

  // 删除部门
  const deleteDepartment = (key: string) => {
    setDepartmentAllocations(departmentAllocations.filter(dept => dept.key !== key));
  };

  // 添加员工到部门
  const addEmployeeToDepartment = (deptKey: string) => {
    const dept = departmentAllocations.find(d => d.key === deptKey);
    if (!dept) return;

    // 计算当前员工权重总和
    const currentEmployeeWeightSum = dept.employeeDistributions.reduce((sum, emp) => {
      return emp.isFixedAmount ? sum : sum + emp.weight;
    }, 0);
    
    // 计算固定金额员工占用的权重等值
    const fixedAmountTotal = dept.employeeDistributions.reduce((sum, emp) => {
      return emp.isFixedAmount ? sum + emp.amount : sum;
    }, 0);
    const maxDistributionTotal = (grossProfit * maxDistributionRatio / 100);
    const fixedAmountWeight = maxDistributionTotal > 0 ? (fixedAmountTotal / maxDistributionTotal) * 100 : 0;
    
    // 可分配的剩余权重
    const remainingWeight = Math.max(0, dept.weight - currentEmployeeWeightSum - fixedAmountWeight);
    
    // 默认权重：取剩余权重的30-50%，但不超过部门权重的10%
    const defaultWeight = Math.min(
      remainingWeight * 0.4, // 剩余权重的40%
      dept.weight * 0.1,     // 部门权重的10%
      5                      // 最大不超过5%
    );

    const newEmployee: EmployeeDistribution = {
      key: `emp_${Date.now()}_${Math.random()}`,
      employeeId: '',
      employeeName: '',
      weight: Math.max(1, defaultWeight), // 最小1%
      amount: 0,
      isFixedAmount: false
    };

    setDepartmentAllocations(prev =>
      prev.map(dept =>
        dept.key === deptKey
          ? {
              ...dept,
              employeeDistributions: [...dept.employeeDistributions, newEmployee],
              expanded: true
            }
          : dept
      )
    );
  };

  // 删除员工
  const deleteEmployee = (deptKey: string, empKey: string) => {
    const updatedAllocations = departmentAllocations.map(dept => {
      if (dept.key === deptKey) {
        return {
          ...dept,
          employeeDistributions: dept.employeeDistributions.filter(emp => emp.key !== empKey)
        };
      }
      return dept;
    });
    setDepartmentAllocations(updatedAllocations);
  };

  // 切换部门展开状态
  const toggleDepartmentExpanded = (key: string) => {
    const updatedAllocations = departmentAllocations.map(dept => {
      if (dept.key === key) {
        return { ...dept, expanded: !dept.expanded };
      }
      return dept;
    });
    setDepartmentAllocations(updatedAllocations);
  };

  // 验证权重
  const validateWeights = (): boolean => {
    // 验证所有部门权重之和不超过100%（基于最大分配比例）
    const totalDeptWeight = departmentAllocations.reduce((sum, dept) => sum + dept.weight, 0);
    if (totalDeptWeight > 100) {
      message.error('所有部门权重之和不能超过100%');
      return false;
    }

    // 验证每个部门下员工权重之和不超过部门权重
    for (const dept of departmentAllocations) {
      const deptWeight = dept.weight;
      
      // 计算员工权重总和（按权重分配的员工）
      const totalEmpWeight = dept.employeeDistributions.reduce((sum, emp) => {
        return emp.isFixedAmount ? sum : sum + emp.weight;
      }, 0);
      
      // 计算固定金额员工占用的权重等值
      const fixedTotal = dept.employeeDistributions.reduce((sum, emp) => {
        return emp.isFixedAmount ? sum + emp.amount : sum;
      }, 0);
      const maxTotal = (grossProfit * maxDistributionRatio / 100);
      const fixedWeight = maxTotal > 0 ? (fixedTotal / maxTotal) * 100 : 0;
      
      const totalUsed = totalEmpWeight + fixedWeight;
      
      if (totalUsed > deptWeight) {
        message.error(`部门 ${dept.departmentName} 的员工权重分配超出部门权重限制`);
        return false;
      }
    }
    
    return true;
  };

  // 保存提成分配
  const handleSave = async () => {
    if (!validateWeights()) {
      return;
    }

    try {
      setLoading(true);
      
      const distributionData = {
        projectId: project?.id,
        distributionMode,
        projectActualAmount,
        grossProfit,
        grossProfitRate,
        maxDistributionRatio,
        maxDistributionAmount,
        totalDistributionAmount: departmentAllocations.reduce((sum, dept) => sum + dept.totalAmount, 0),
        departmentAllocations
      };

      console.log('保存提成分配数据:', distributionData);
      
      // 调用保存API
      const response = await projectApi.saveProfitDistribution(distributionData);
      if (response.resp_code === 0) {
        message.success('提成分配方案保存成功');
        onSuccess();
        onCancel();
      } else {
        message.error('保存失败: ' + (response.resp_msg || '未知错误'));
      }
      
    } catch (error) {
      console.error('保存提成分配失败:', error);
      message.error('保存失败: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`项目提成分配 - ${project?.name}${hasExistingData ? ' (编辑模式)' : ' (新建模式)'}`}
      open={visible}
      onCancel={onCancel}
      onOk={handleSave}
      width={1200}
      confirmLoading={loading}
      destroyOnClose
    >
      {/* 项目基础信息和提成设置 */}
      <div style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="项目实际金额"
                value={projectActualAmount}
                precision={2}
                prefix={<DollarOutlined />}
                formatter={(value) => `¥ ${value?.toLocaleString() || 0}`}
              />
              <div style={{ marginTop: 8 }}>
                <InputNumber
                  value={projectActualAmount}
                  onChange={(value) => setProjectActualAmount(value || 0)}
                  min={0}
                  precision={2}
                  formatter={value => `¥ ${String(value || '')}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => Number(String(value || '').replace(/¥\s?|(,*)/g, ''))}
                  style={{ width: '100%' }}
                  size="small"
                />
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="毛利润"
                value={grossProfit}
                precision={2}
                prefix={<BankOutlined />}
                formatter={(value) => `¥ ${value?.toLocaleString() || 0}`}
              />
              <div style={{ marginTop: 8 }}>
                <InputNumber
                  value={grossProfit}
                  onChange={(value) => setGrossProfit(value || 0)}
                  min={0}
                  precision={2}
                  formatter={value => `¥ ${String(value || '')}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => Number(String(value || '').replace(/¥\s?|(,*)/g, ''))}
                  style={{ width: '100%' }}
                  size="small"
                />
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="毛利率"
                value={grossProfitRate}
                precision={2}
                suffix="%"
                prefix={<PercentageOutlined />}
                valueStyle={{ color: grossProfitRate >= 30 ? '#3f8600' : grossProfitRate >= 15 ? '#faad14' : '#cf1322' }}
              />
              <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                自动计算：毛利润 ÷ 实际金额
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="最大分配比例"
                value={maxDistributionRatio}
                precision={0}
                suffix="%"
                prefix={<PercentageOutlined />}
              />
              <div style={{ marginTop: 8 }}>
                <InputNumber
                  value={maxDistributionRatio}
                  onChange={(value) => setMaxDistributionRatio(value || 50)}
                  min={0}
                  max={100}
                  precision={0}
                  formatter={value => `${String(value || '')}%`}
                  parser={value => Number(String(value || '').replace('%', ''))}
                  style={{ width: '100%' }}
                  size="small"
                />
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="最大提成金额"
                value={maxDistributionAmount}
                precision={2}
                prefix={<BankOutlined />}
                formatter={(value) => `¥ ${value?.toLocaleString() || 0}`}
                valueStyle={{ color: '#1890ff' }}
              />
              <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                自动计算：毛利润 × 最大分配比例
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="实际分配金额"
                value={departmentAllocations.reduce((sum, dept) => sum + dept.totalAmount, 0)}
                precision={2}
                prefix={<BankOutlined />}
                formatter={(value) => `¥ ${value?.toLocaleString() || 0}`}
                valueStyle={{ color: '#52c41a' }}
              />
              <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                基于部门权重自动计算
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="分配利用率"
                value={maxDistributionAmount > 0 ? 
                  ((departmentAllocations.reduce((sum, dept) => sum + dept.totalAmount, 0) / maxDistributionAmount) * 100) : 0}
                precision={1}
                suffix="%"
                prefix={<PercentageOutlined />}
                valueStyle={{ 
                  color: departmentAllocations.reduce((sum, dept) => sum + dept.totalAmount, 0) / maxDistributionAmount > 0.8 ? '#52c41a' : '#faad14' 
                }}
              />
              <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                实际分配 ÷ 最大可分配
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <Divider>部门提成分配</Divider>

      <Form form={form} layout="vertical">
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={addDepartment}>
              添加部门
            </Button>
            <span style={{ color: '#666' }}>
              权重约束：所有部门权重之和 ≤ 100%（基于最大分配比例），员工权重之和 ≤ 部门权重
            </span>
            <Text type="secondary">
              最大可分配：¥{maxDistributionAmount.toLocaleString()}
            </Text>
            {hasExistingData && (
              <Text type="success" style={{ marginLeft: 16 }}>
                ✓ 正在编辑已保存的分配方案
              </Text>
            )}
          </Space>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #d9d9d9' }}>
          <thead>
            <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #d9d9d9' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderRight: '1px solid #d9d9d9' }}>部门/员工</th>
              <th style={{ padding: '12px', textAlign: 'left', borderRight: '1px solid #d9d9d9' }}>权重/金额</th>
              <th style={{ padding: '12px', textAlign: 'left', borderRight: '1px solid #d9d9d9' }}>分配金额</th>
              <th style={{ padding: '12px', textAlign: 'left', borderRight: '1px solid #d9d9d9' }}>部门储备金</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {departmentAllocations.map(dept => {
              // 计算部门实际储备金情况
              const deptTotalAmount = dept.totalAmount;
              const employeeTotalAmount = dept.employeeDistributions.reduce((sum, emp) => sum + emp.amount, 0);
              const actualReserveAmount = deptTotalAmount - employeeTotalAmount;
              const actualReserveRatio = deptTotalAmount > 0 ? (actualReserveAmount / deptTotalAmount) * 100 : 0;
              
              return (
                <React.Fragment key={dept.key}>
                  {/* 部门行 */}
                  <tr style={{ borderBottom: '1px solid #d9d9d9' }}>
                    <td style={{ padding: '12px', borderRight: '1px solid #d9d9d9' }}>
                      <Space>
                        <Button
                          type="text"
                          size="small"
                          onClick={() => toggleDepartmentExpanded(dept.key)}
                        >
                          {dept.expanded ? '▼' : '▶'}
                        </Button>
                        {hasExistingData ? (
                          // 编辑模式：显示部门名称，不允许修改
                          <Text strong style={{ color: '#1890ff', minWidth: '200px', display: 'inline-block' }}>
                            {dept.departmentName}
                          </Text>
                        ) : (
                          // 新建模式：可以选择部门
                          <Select
                            value={dept.departmentId || undefined}
                            onChange={(value) => {
                              const selectedDept = availableDepartments.find(d => d.value === value);
                              updateDepartment(dept.key, 'departmentId', value);
                              updateDepartment(dept.key, 'departmentName', selectedDept?.name || '');
                            }}
                            placeholder="选择部门"
                            style={{ width: '200px' }}
                          >
                            {availableDepartments.map(option => (
                              <Select.Option key={option.value} value={option.value}>
                                {option.label}
                              </Select.Option>
                            ))}
                          </Select>
                        )}
                      </Space>
                    </td>
                    <td style={{ padding: '12px', borderRight: '1px solid #d9d9d9' }}>
                      <InputNumber
                        value={dept.weight}
                        onChange={(value) => updateDepartment(dept.key, 'weight', value || 0)}
                        min={0}
                        max={100}
                        precision={2}
                        formatter={value => `${String(value || '')}%`}
                        parser={value => Number(String(value || '').replace('%', ''))}
                        style={{ width: '100px' }}
                      />
                    </td>
                    <td style={{ padding: '12px', borderRight: '1px solid #d9d9d9' }}>
                      ¥{dept.totalAmount.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px', borderRight: '1px solid #d9d9d9' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div>
                          <span style={{ fontSize: '12px', color: '#666' }}>比例：</span>
                          <span style={{ fontWeight: 'bold', color: actualReserveRatio > 30 ? '#ff4d4f' : '#52c41a' }}>
                            {actualReserveRatio.toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span style={{ fontSize: '12px', color: '#666' }}>金额：</span>
                          <span style={{ fontWeight: 'bold' }}>
                            ¥{actualReserveAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Space>
                        <Button
                          type="text"
                          icon={<PlusOutlined />}
                          onClick={() => addEmployeeToDepartment(dept.key)}
                          size="small"
                        >
                          添加员工
                        </Button>
                        <Popconfirm
                          title="确定删除这个部门吗？"
                          onConfirm={() => deleteDepartment(dept.key)}
                        >
                          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                        </Popconfirm>
                      </Space>
                    </td>
                  </tr>
                  {/* 员工行 */}
                  {dept.expanded && dept.employeeDistributions.map(emp => (
                    <tr key={emp.key} style={{ 
                      backgroundColor: '#f9f9f9',
                      borderLeft: '3px solid #1890ff'
                    }}>
                      <td style={{ 
                        padding: '12px 12px 12px 32px', 
                        borderRight: '1px solid #d9d9d9',
                        position: 'relative'
                      }}>
                        <div style={{
                          position: 'absolute',
                          left: '20px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#bfbfbf',
                          fontSize: '12px'
                        }}>
                          │
                        </div>
                        <div style={{
                          position: 'absolute',
                          left: '20px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#bfbfbf',
                          fontSize: '12px',
                          marginTop: '2px'
                        }}>
                          ├─
                        </div>
                        <Space style={{ marginLeft: '16px' }}>
                          <span style={{ 
                            color: '#1890ff',
                            fontSize: '14px',
                            fontWeight: 500 
                          }}>
                            👤
                          </span>
                          {hasExistingData ? (
                            // 编辑模式：显示员工姓名，不允许修改
                            <Text style={{ 
                              minWidth: '150px', 
                              display: 'inline-block',
                              color: '#262626',
                              fontWeight: 500
                            }}>
                              {emp.employeeName}
                            </Text>
                          ) : (
                            // 新建模式：显示已分配的员工姓名（不可修改）或提供选择
                            emp.employeeId && emp.employeeName ? (
                              <Text style={{ 
                                minWidth: '150px', 
                                display: 'inline-block',
                                color: '#262626',
                                fontWeight: 500
                              }}>
                                {emp.employeeName}
                              </Text>
                            ) : (
                              <Select
                                value={emp.employeeId || undefined}
                                onChange={(value) => {
                                  // 查找员工真实姓名
                                  const employeeDetails = Array.from(employeeDepartmentMap.entries())
                                    .find(([empId]) => String(empId) === value);
                                  
                                  updateEmployee(dept.key, emp.key, 'employeeId', value);
                                  updateEmployee(dept.key, emp.key, 'employeeName', 
                                    employeeDetails ? `员工${value}` : `员工${value}`);
                                }}
                                placeholder="选择员工"
                                style={{ width: '150px' }}
                              >
                                {Array.from(employeeDepartmentMap.entries())
                                  .filter(([empId, deptInfo]) => deptInfo.id === dept.departmentId)
                                  .map(([empId, deptInfo]) => (
                                    <Select.Option key={empId} value={String(empId)}>
                                      员工{empId}
                                    </Select.Option>
                                  ))}
                              </Select>
                            )
                          )}
                        </Space>
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        borderRight: '1px solid #d9d9d9',
                        backgroundColor: '#ffffff'
                      }}>
                        {emp.isFixedAmount ? (
                          <div>
                            <InputNumber
                              value={emp.amount}
                              onChange={(value) => updateEmployee(dept.key, emp.key, 'amount', value || 0)}
                              min={0}
                              precision={2}
                              formatter={value => `¥ ${String(value || '')}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={value => Number(String(value || '').replace(/¥\s?|(,*)/g, ''))}
                              style={{ width: '120px' }}
                              size="small"
                            />
                            <div style={{ 
                              fontSize: '11px', 
                              color: '#52c41a', 
                              marginTop: '4px',
                              fontWeight: 500
                            }}>
                              固定金额模式
                            </div>
                          </div>
                        ) : (
                          <div>
                            <InputNumber
                              value={emp.weight}
                              onChange={(value) => updateEmployee(dept.key, emp.key, 'weight', value || 0)}
                              min={0}
                              max={100}
                              precision={2}
                              formatter={value => `${String(value || '')}%`}
                              parser={value => Number(String(value || '').replace('%', ''))}
                              style={{ width: '100px' }}
                              size="small"
                            />
                            {/* 显示权重约束提示 */}
                            <div style={{ 
                              fontSize: '11px', 
                              marginTop: '4px',
                              padding: '2px 6px',
                              borderRadius: '3px',
                              backgroundColor: '#f6f6f6',
                              border: '1px solid #e8e8e8'
                            }}>
                              {(() => {
                                // 计算当前部门员工权重使用情况
                                const currentEmpWeightSum = dept.employeeDistributions.reduce((sum, e) => {
                                  return e.isFixedAmount ? sum : sum + e.weight;
                                }, 0);
                                
                                // 计算固定金额占用的权重
                                const fixedTotal = dept.employeeDistributions.reduce((sum, e) => {
                                  return e.isFixedAmount ? sum + e.amount : sum;
                                }, 0);
                                const maxTotal = (grossProfit * maxDistributionRatio / 100);
                                const fixedWeight = maxTotal > 0 ? (fixedTotal / maxTotal) * 100 : 0;
                                
                                const totalUsed = currentEmpWeightSum + fixedWeight;
                                const remaining = Math.max(0, dept.weight - totalUsed);
                                
                                const isOverLimit = totalUsed > dept.weight;
                                
                                return (
                                  <span style={{ 
                                    color: isOverLimit ? '#ff4d4f' : '#52c41a',
                                    fontWeight: 500
                                  }}>
                                    已用: {totalUsed.toFixed(1)}% / 部门: {dept.weight.toFixed(1)}%
                                    {isOverLimit && (
                                      <span style={{ 
                                        color: '#ff4d4f', 
                                        marginLeft: '4px',
                                        fontWeight: 'bold' 
                                      }}>
                                        ⚠️ 超限!
                                      </span>
                                    )}
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        borderRight: '1px solid #d9d9d9',
                        backgroundColor: '#ffffff'
                      }}>
                        <Text strong style={{ 
                          color: '#262626',
                          fontSize: '14px'
                        }}>
                          ¥{emp.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        borderRight: '1px solid #d9d9d9',
                        textAlign: 'center',
                        backgroundColor: '#ffffff'
                      }}>
                        {/* 员工行不显示储备金信息 */}
                        <span style={{ color: '#bfbfbf', fontSize: '14px' }}>—</span>
                      </td>
                      <td style={{ 
                        padding: '12px',
                        backgroundColor: '#ffffff'
                      }}>
                        <Space size="small">
                          <Radio.Group
                            value={emp.isFixedAmount ? 'fixed' : 'ratio'}
                            onChange={(e) => updateEmployee(dept.key, emp.key, 'isFixedAmount', e.target.value === 'fixed')}
                            size="small"
                            style={{ 
                              border: '1px solid #d9d9d9',
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}
                          >
                            <Radio.Button value="ratio" style={{ borderRadius: 0 }}>
                              按比例
                            </Radio.Button>
                            <Radio.Button value="fixed" style={{ borderRadius: 0 }}>
                              固定额
                            </Radio.Button>
                          </Radio.Group>
                          <Popconfirm
                            title="确定删除这个员工吗？"
                            onConfirm={() => deleteEmployee(dept.key, emp.key)}
                            placement="topRight"
                          >
                            <Button 
                              type="text" 
                              danger 
                              icon={<DeleteOutlined />} 
                              size="small" 
                              style={{
                                borderRadius: '4px',
                                border: '1px solid transparent'
                              }}
                            />
                          </Popconfirm>
                        </Space>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
            {/* 汇总行 */}
            <tr style={{ backgroundColor: '#f0f2f5', borderTop: '2px solid #d9d9d9', fontWeight: 'bold' }}>
              <td style={{ padding: '12px', borderRight: '1px solid #d9d9d9' }}>
                <Text strong>汇总</Text>
              </td>
              <td style={{ padding: '12px', borderRight: '1px solid #d9d9d9' }}>
                <Text strong style={{ 
                  color: departmentAllocations.reduce((sum, dept) => sum + dept.weight, 0) > 100 ? '#ff4d4f' : '#52c41a' 
                }}>
                  {departmentAllocations.reduce((sum, dept) => sum + dept.weight, 0).toFixed(2)}%
                </Text>
                <Text type="secondary" style={{ marginLeft: 8, fontSize: '12px' }}>
                  / 100%
                </Text>
              </td>
              <td style={{ padding: '12px', borderRight: '1px solid #d9d9d9' }}>
                <Text strong>
                  ¥{departmentAllocations.reduce((sum, dept) => sum + dept.totalAmount, 0).toFixed(2)}
                </Text>
              </td>
              <td style={{ padding: '12px', borderRight: '1px solid #d9d9d9' }}>
                <Text strong>
                  ¥{departmentAllocations.reduce((sum, dept) => {
                    const employeeTotal = dept.employeeDistributions.reduce((empSum, emp) => empSum + emp.amount, 0);
                    return sum + (dept.totalAmount - employeeTotal);
                  }, 0).toFixed(2)}
                </Text>
              </td>
              <td style={{ padding: '12px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  剩余：¥{(maxDistributionAmount - departmentAllocations.reduce((sum, dept) => sum + dept.totalAmount, 0)).toLocaleString()}
                </Text>
              </td>
            </tr>
          </tbody>
        </table>

        {/* 分配详情汇总 */}
        <div style={{ marginTop: 16, padding: 16, backgroundColor: '#fafafa', borderRadius: 6 }}>
          <Row gutter={16}>
            <Col span={5}>
              <Text type="secondary">总权重使用：</Text>
              <Text strong style={{ 
                color: departmentAllocations.reduce((sum, dept) => sum + dept.weight, 0) > 100 ? '#ff4d4f' : '#52c41a',
                marginLeft: 8 
              }}>
                {departmentAllocations.reduce((sum, dept) => sum + dept.weight, 0).toFixed(2)}% / 100%
              </Text>
            </Col>
            <Col span={5}>
              <Text type="secondary">员工分配：</Text>
              <Text strong style={{ marginLeft: 8 }}>
                ¥{departmentAllocations.reduce((sum, dept) => {
                  const employeeTotal = dept.employeeDistributions.reduce((empSum, emp) => empSum + emp.amount, 0);
                  return sum + employeeTotal;
                }, 0).toLocaleString()}
              </Text>
            </Col>
            <Col span={5}>
              <Text type="secondary">储备金总额：</Text>
              <Text strong style={{ marginLeft: 8 }}>
                ¥{departmentAllocations.reduce((sum, dept) => {
                  const employeeTotal = dept.employeeDistributions.reduce((empSum, emp) => empSum + emp.amount, 0);
                  return sum + (dept.totalAmount - employeeTotal);
                }, 0).toLocaleString()}
              </Text>
            </Col>
            <Col span={5}>
              <Text type="secondary">剩余可分配：</Text>
              <Text strong style={{ marginLeft: 8 }}>
                ¥{(maxDistributionAmount - departmentAllocations.reduce((sum, dept) => sum + dept.totalAmount, 0)).toLocaleString()}
              </Text>
            </Col>
            <Col span={4}>
              <Text type="secondary">分配利用率：</Text>
              <Text strong style={{ marginLeft: 8 }}>
                {maxDistributionAmount > 0 ? 
                  ((departmentAllocations.reduce((sum, dept) => sum + dept.totalAmount, 0) / maxDistributionAmount) * 100).toFixed(1) 
                  : '0'}%
              </Text>
            </Col>
          </Row>
        </div>
      </Form>
    </Modal>
  );
};

export default ProfitDistributionModal; 