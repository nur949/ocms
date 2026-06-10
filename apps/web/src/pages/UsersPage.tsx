import { Table, Button, Space, Tag, Card, Modal, Form, Input, Select, message, Popconfirm, Typography, Tooltip, Row, Col } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { API_URL } from '../utils/config';
import { useState } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, MailOutlined, LockOutlined, SearchOutlined, SafetyCertificateOutlined, FileExcelOutlined } from '@ant-design/icons';
import { exportToCSV } from '../utils/csvExport';

const { Title, Text } = Typography;

const UsersPage = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  // Fetch Users
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    },
  });

  const handleExport = () => {
    const headers = {
      name: 'Full Name',
      email: 'Email',
      'role.name': 'Role',
      status: 'Status'
    };
    exportToCSV(users, headers, 'Users');
  };

  // Fetch Roles
  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/users/roles`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    },
  });

  // Create User Mutation
  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      const response = await axios.post(`${API_URL}/users`, values, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    },
    onSuccess: () => {
      message.success('User created successfully');
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to create user');
    },
  });

  // Update User Mutation
  const updateMutation = useMutation({
    mutationFn: async (values: any) => {
      const response = await axios.put(`${API_URL}/users/${editingRecord.id}`, values, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    },
    onSuccess: () => {
      message.success('User updated successfully');
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to update user');
    },
  });

  // Delete User Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    },
    onSuccess: () => {
      message.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to delete user');
    },
  });

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      roleId: record.roleId,
      status: record.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (values: any) => {
    if (editingRecord) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const filteredData = users?.filter((item: any) => 
    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.email.toLowerCase().includes(searchText.toLowerCase()) ||
    item.role?.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { 
      title: 'SL', 
      key: 'sl', 
      width: 60, 
      align: 'center' as const,
      render: (_: any, __: any, index: number) => index + 1 
    },
    { 
      title: 'User', 
      key: 'user',
      render: (_: any, record: any) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <div>
            <div style={{ fontWeight: '600' }}>{record.name}</div>
            <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.45)' }}>{record.email}</div>
          </div>
        </Space>
      )
    },
    { 
      title: 'Role', 
      dataIndex: ['role', 'name'], 
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'super-admin' ? 'volcano' : 'geekblue'} bordered={false}>
          {role?.toUpperCase()}
        </Tag>
      )
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'error'} bordered={false}>
          {status?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined style={{ color: '#1890ff' }} />} 
              onClick={() => handleEdit(record)} 
            />
          </Tooltip>
          {record.email !== 'admin@ocms.com' && (
            <Tooltip title="Delete">
              <Popconfirm
                title="Delete user?"
                description="This will permanently remove the user account."
                onConfirm={() => deleteMutation.mutate(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>User Management</Title>
          <Text type="secondary">Manage administrative accounts and permissions</Text>
        </div>
        <Space wrap>
          <Input
            placeholder="Search users..."
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Button 
            icon={<FileExcelOutlined />} 
            onClick={handleExport}
            disabled={!users || users.length === 0}
          >
            Export CSV
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => {
              setEditingRecord(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
          >
            Add User
          </Button>
        </Space>
      </div>

      <Table 
        columns={columns} 
        dataSource={filteredData} 
        loading={isLoading} 
        rowKey="id" 
        bordered
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} users`
        }}
      />

      <Modal
        title={editingRecord ? 'Edit User' : 'Add New User'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Form.Item 
            name="name" 
            label="Full Name" 
            rules={[{ required: true, message: 'Please enter full name' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Full Name" />
          </Form.Item>
          <Form.Item 
            name="email" 
            label="Email Address" 
            rules={[{ required: true, type: 'email', message: 'Please enter valid email' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email Address" />
          </Form.Item>
          
          <Form.Item 
            name="password" 
            label={editingRecord ? 'New Password (Leave blank to keep current)' : 'Password'} 
            rules={[{ required: !editingRecord, message: 'Please enter password' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="roleId" label="User Role" rules={[{ required: true, message: 'Please select role' }]}>
                <Select placeholder="Select role" suffixIcon={<SafetyCertificateOutlined />}>
                  {roles?.map((role: any) => (
                    <Select.Option key={role.id} value={role.id}>{role.name.toUpperCase()}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Status" initialValue="active">
                <Select>
                  <Select.Option value="active">Active</Select.Option>
                  <Select.Option value="inactive">Inactive</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, marginTop: 16, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editingRecord ? 'Update User' : 'Create User'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default UsersPage;
