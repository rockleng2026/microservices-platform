import React, { useEffect, useState } from 'react';
import { Modal, Table, Button, Input, Select, InputNumber, message, Space } from 'antd';
import { getAccrualConfig, saveAccrualConfig } from '@/services/projectAccrual';
import { useMemo } from 'react';

const { Option } = Select;

interface ProjectAccrualConfigModalProps {
  visible: boolean;
  projectId: number;
  onCancel: () => void;
  onSuccess: () => void;
  modelVariableOptions: { label: string; value: string }[];
}

const fixedTypes = [
  { label: '集团分配', value: 'group' },
  { label: '部门分配', value: 'department' },
  { label: '项目个人分配', value: 'project_individual' },
  { label: '项目团队分配', value: 'project_team' },
];

const ProjectAccrualConfigModal: React.FC<ProjectAccrualConfigModalProps> = ({ visible, projectId, onCancel, onSuccess, modelVariableOptions }) => {
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState<any[]>([]);
  const [modelInstanceId, setModelInstanceId] = useState<number | undefined>();
  const [variableMap, setVariableMap] = useState<Record<string, any>>({});

  useEffect(() => {
    if (visible && projectId) {
      getAccrualConfig(projectId).then(res => {
        const list = res?.datas || [];
        // 保证4个类型都存在，按顺序补齐
        const arr = fixedTypes.map((t, idx) => {
          const found = list.find((c: any) => c.type === t.value) || {};
          return {
            ...found,
            type: t.value,
            name: found.name || t.label,
            modelVariableCode: found.modelVariableCode || '',
            sort: found.sort ?? idx,
          };
        });
        setConfigs(arr);
      });
    }
  }, [visible, projectId]);

  // 获取 model_instance_id
  useEffect(() => {
    if (visible && projectId) {
      // 通过 props 传递或外部 context 传递 model_instance_id
      // 这里假设 projectId 能查到 model_instance_id，实际可根据父组件传递
      // 这里直接用 projectId 作为 model_instance_id（如需调整请根据实际传递）
      setModelInstanceId(projectId);
    }
  }, [visible, projectId]);

  // 变量code到详细信息的映射
  useEffect(() => {
    const map: Record<string, any> = {};
    modelVariableOptions.forEach(v => {
      if (v.value && v.calculationFormula !== undefined) {
        map[v.value] = v;
      }
    });
    setVariableMap(map);
  }, [modelVariableOptions]);

  const updateRow = (idx: number, key: string, value: any) => {
    setConfigs(list => {
      const arr = [...list];
      arr[idx] = { ...arr[idx], [key]: value };
      return arr;
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // 严格按后端对象属性映射字段
      const data = configs.map(item => ({
        id: item.id || undefined,
        projectId: projectId,
        modelInstanceId: modelInstanceId,
        type: item.type,
        name: item.name,
        modelVariableCode: item.modelVariableCode,
        maxAmount: item.maxAmount || 0,
        maxRatio: item.maxRatio || 0,
        sort: item.sort || 0,
        createdAt: item.createdAt || undefined,
        updatedAt: item.updatedAt || undefined,
      }));
      await saveAccrualConfig(projectId, data);
      message.success('保存成功');
      onSuccess();
      onCancel();
    } catch (e) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: '分配类型', dataIndex: 'type', render: (v: string) => {
      const t = fixedTypes.find(t => t.value === v);
      return t ? t.label : v;
    } },
    { title: '名称', dataIndex: 'name', width: 180, render: (v: string, r: any, i: number) => <Input value={v} onChange={e => updateRow(i, 'name', e.target.value)} style={{ width: 160 }} /> },
    { title: '模型变量', dataIndex: 'modelVariableCode', render: (v: string, r: any, i: number) => (
      <div>
        <Select value={v} onChange={val => updateRow(i, 'modelVariableCode', val)} style={{ width: 180 }}>
          {modelVariableOptions.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>)}
        </Select>
        {variableMap[v]?.calculationFormula && (
          <div style={{ color: '#888', fontSize: 12, marginTop: 4, maxWidth: 360, wordBreak: 'break-all' }}>
            表达式: {variableMap[v].calculationFormula}
          </div>
        )}
      </div>
    ) },
  ];

  return (
    <Modal
      title="项目计提配置"
      open={visible}
      onCancel={onCancel}
      width={900}
      footer={[
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="save" type="primary" loading={loading} onClick={handleSave}>保存</Button>,
      ]}
      destroyOnClose
    >
      <Table columns={columns} dataSource={configs} rowKey={(r) => r.type} pagination={false} size="small" />
    </Modal>
  );
};

export default ProjectAccrualConfigModal; 