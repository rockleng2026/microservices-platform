/**
 * 促销活动列表表格 - ADMIN-05
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Table, Tag, Space, Button, Popconfirm, message, Form, Select, Input, DatePicker } from 'antd';
import { EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/lib/table';
import { ProTable } from '@ant-design/pro-components';
import type { ActionRef } from '@ant-design/pro-components';
import dayjs from 'dayjs';
import PromotionModal from './PromotionModal';
import {
  getPromotionList,
  PromotionDTO,
  PROMOTION_TYPE_TEXT,
  PROMOTION_STATUS_TEXT,
  PROMOTION_STATUS_COLOR,
  PromotionStatus,
} from '@/services/mall-admin/promotion';

const { RangePicker } = DatePicker;

interface PromotionTableProps {
  refreshKey: number;
  onToggle: (id: number, enabled: boolean) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const PromotionTable: React.FC<PromotionTableProps> = ({ refreshKey, onToggle, onDelete }) => {
  const actionRef = useRef<ActionRef>();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PromotionDTO | null>(null);

  // 刷新时重新加载
  useEffect(() => {
    actionRef.current?.reload();
  }, [refreshKey]);

  // 获取列表数据
  const fetchData = useCallback(async (params: any) => {
    try {
      const result = await getPromotionList({
        page: params.current || 1,
        pageSize: params.pageSize || 20,
        status: params.status,
        keyword: params.keyword,
        startTime: params.startTime?.[0]?.format('YYYY-MM-DD'),
        endTime: params.startTime?.[1]?.format('YYYY-MM-DD'),
      });
      return {
        data: result.records,
        total: result.total,
        success: true,
      };
    } catch (error) {
      console.error('Failed to fetch promotion list:', error);
      message.error('加载促销活动列表失败');
      return { data: [], total: 0, success: false };
    }
  }, []);

  // 打开编辑弹窗
  const handleEdit = (record: PromotionDTO) => {
    setEditingRecord(record);
    setModalVisible(true);
  };

  // 新建活动
  const handleCreate = () => {
    setEditingRecord(null);
    setModalVisible(true);
  };

  // 表格列定义
  const columns: ColumnsType<PromotionDTO> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
    },
    {
      title: '活动名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      align: 'center',
      render: (type: number) => PROMOTION_TYPE_TEXT[type] || '未知',
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 170,
      align: 'center',
      render: (time: string) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 170,
      align: 'center',
      render: (time: string) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: number) => (
        <Tag color={PROMOTION_STATUS_COLOR[status] || 'default'}>
          {PROMOTION_STATUS_TEXT[status] || '未知'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
      align: 'center',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      align: 'center',
      render: (_: unknown, record: PromotionDTO) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="删除后不可恢复，确定要删除吗？"
            onConfirm={() => onDelete(record.id!)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
          {record.status === PromotionStatus.ENABLED ? (
            <Button type="link" size="small" onClick={() => onToggle(record.id!, false)}>
              禁用
            </Button>
          ) : (
            <Button type="link" size="small" onClick={() => onToggle(record.id!, true)}>
              启用
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <ProTable<PromotionDTO>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={fetchData}
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
        }}
        toolBarRender={() => [
          <Button key="create" type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建活动
          </Button>,
        ]}
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />

      {/* 新建/编辑弹窗 */}
      <PromotionModal
        visible={modalVisible}
        record={editingRecord}
        onClose={() => setModalVisible(false)}
        onSuccess={() => {
          setModalVisible(false);
          actionRef.current?.reload();
        }}
      />
    </div>
  );
};

export default PromotionTable;