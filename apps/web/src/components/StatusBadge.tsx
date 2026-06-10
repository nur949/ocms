import React from 'react';
import { Tag } from 'antd';
import { 
  ClockCircleOutlined, 
  UserOutlined, 
  SyncOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  HistoryOutlined
} from '@ant-design/icons';

export type StatusType = 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled' | 'previous-pending';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const s = status.toLowerCase();

  switch (s) {
    case 'pending':
      return <Tag icon={<ClockCircleOutlined />} color="orange">PENDING</Tag>;
    case 'assigned':
      return <Tag icon={<UserOutlined />} color="blue">ASSIGNED</Tag>;
    case 'in-progress':
      return <Tag icon={<SyncOutlined spin />} color="cyan">IN PROGRESS</Tag>;
    case 'completed':
      return <Tag icon={<CheckCircleOutlined />} color="green">COMPLETED</Tag>;
    case 'cancelled':
      return <Tag icon={<CloseCircleOutlined />} color="red">CANCELLED</Tag>;
    case 'previous-pending':
      return <Tag icon={<HistoryOutlined />} color="volcano">PREVIOUS PENDING</Tag>;
    default:
      return <Tag>{status.toUpperCase()}</Tag>;
  }
};

export default StatusBadge;
