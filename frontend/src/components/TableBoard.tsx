import React from 'react';
import { Table, Tag, Button, Dropdown } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  FlagOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  MinusCircleOutlined,
  DeleteOutlined,
  MoreOutlined
} from '@ant-design/icons';
import type { Task, TaskStatus, User, TaskPriority } from '../types';

interface TableBoardProps {
  tasks: Task[];
  users: User[];
  onDeleteTask: (taskId: string) => void;
  onChangeStatus: (taskId: string, status: TaskStatus) => void;
  onChangePriority: (taskId: string, priority: string) => void;
}

const STATUS_MAP: Record<TaskStatus, { label: string, color: string, icon: React.ReactNode }> = {
  TO_DO: { label: 'Phải làm', color: 'default', icon: <MinusCircleOutlined /> },
  IN_PROGRESS: { label: 'Đang tiến hành', color: 'processing', icon: <ClockCircleOutlined /> },
  DONE: { label: 'Hoàn thành', color: 'success', icon: <CheckCircleOutlined /> },
};

const PRIORITY_MAP: Record<TaskPriority, { label: string, color: string }> = {
  LOW: { label: 'Thấp', color: 'default' },
  MEDIUM: { label: 'Trung bình', color: 'warning' },
  HIGH: { label: 'Cao', color: 'orange' },
  URGENT: { label: 'Khẩn cấp', color: 'error' },
};

const TableBoard: React.FC<TableBoardProps> = ({
  tasks,
  users,
  onDeleteTask,
  onChangeStatus,
  onChangePriority,
}) => {
  const columns: ColumnsType<Task> = [
    {
      title: 'Tên nhiệm vụ',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <span style={{ fontWeight: 500, color: '#e8f4ff' }}>{text}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: TaskStatus, record) => {
        const s = STATUS_MAP[status] || { label: status, color: 'default', icon: <CheckCircleOutlined /> };
        return (
          <Dropdown
            menu={{
              items: Object.entries(STATUS_MAP).map(([key, val]) => ({
                key,
                label: val.label,
                icon: val.icon,
                onClick: () => onChangeStatus(record._id || record.id!, key as TaskStatus),
              }))
            }}
            trigger={['click']}
          >
            <Tag color={s.color} style={{ cursor: 'pointer', borderRadius: 4 }}>
              {s.icon} {s.label}
            </Tag>
          </Dropdown>
        );
      },
    },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: TaskPriority, record) => {
        const p = PRIORITY_MAP[priority];
        return (
          <Dropdown
            menu={{
              items: Object.entries(PRIORITY_MAP).map(([key, val]) => ({
                key,
                label: val.label,
                onClick: () => onChangePriority(record._id || record.id!, key as TaskPriority),
              }))
            }}
            trigger={['click']}
          >
            <Tag color={p.color} style={{ cursor: 'pointer', borderRadius: 4 }}>
              <FlagOutlined /> {p.label}
            </Tag>
          </Dropdown>
        );
      },
    },
    {
      title: 'Thời gian',
      key: 'dates',
      render: (_, record) => {
        const start = record.startDate ? new Date(record.startDate).toLocaleDateString('vi-VN') : '';
        const due = record.dueDate ? new Date(record.dueDate).toLocaleDateString('vi-VN') : '';
        if (start && due) return `${start} - ${due}`;
        if (start) return `Từ ${start}`;
        if (due) return `Đến ${due}`;
        return '—';
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => onDeleteTask(record._id || record.id!)}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '20px', background: 'rgba(6,18,34,0.6)', borderRadius: 12, margin: 20 }}>
      <Table
        columns={columns}
        dataSource={tasks}
        rowKey={(r) => r._id || r.id!}
        pagination={false}
        style={{ background: 'transparent' }}
        rowClassName={() => 'custom-table-row'}
      />
    </div>
  );
};

export default TableBoard;
