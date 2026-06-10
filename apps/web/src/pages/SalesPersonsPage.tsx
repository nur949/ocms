import { Table, Button, Space, Tag, Card, Modal, Form, Input, Select, message, Popconfirm, Typography, Row, Col, Grid } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { API_URL } from '../utils/config';
import { UserAddOutlined, EditOutlined, DeleteOutlined, SearchOutlined, PhoneOutlined, MailOutlined, UserOutlined, FileExcelOutlined, PrinterOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { exportToCSV } from '../utils/csvExport';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const SalesPersonsPage = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  // Fetch Sales Persons
  const { data: salesPersons, isLoading } = useQuery({
    queryKey: ['salesPersons'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/sales-persons`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    },
  });

  const handleExport = () => {
    const headers = {
      salesPersonId: 'Sales Person ID',
      name: 'Name',
      phone: 'Phone',
      email: 'Email',
      '_count.sales': 'Total Sales',
      status: 'Status'
    };
    exportToCSV(salesPersons, headers, 'Sales_Persons');
  };

  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      const response = await axios.post(`${API_URL}/sales-persons`, values, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    },
    onSuccess: () => {
      message.success('Sales Person added successfully');
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['salesPersons'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: any) => {
      const response = await axios.put(`${API_URL}/sales-persons/${editingRecord.id}`, values, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    },
    onSuccess: () => {
      message.success('Sales Person updated successfully');
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['salesPersons'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${API_URL}/sales-persons/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    },
    onSuccess: () => {
      message.success('Sales Person deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['salesPersons'] });
    },
  });

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleSubmit = (values: any) => {
    if (editingRecord) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const filteredData = salesPersons?.filter((item: any) => 
    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.salesPersonId.toLowerCase().includes(searchText.toLowerCase()) ||
    item.phone?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.email?.toLowerCase().includes(searchText.toLowerCase())
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
      title: 'ID/Name', 
      key: 'idName',
      width: 200,
      render: (_: any, record: any) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.name}</div>
          <div style={{ fontSize: '11px', color: '#888' }}>{record.salesPersonId}</div>
        </div>
      )
    },
    { 
      title: 'Contact', 
      key: 'contact',
      width: 180,
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          {record.phone && <Text style={{ fontSize: '12px' }}><PhoneOutlined /> {record.phone}</Text>}
          {record.email && <Text style={{ fontSize: '12px' }}><MailOutlined /> {record.email}</Text>}
        </Space>
      )
    },
    { 
      title: 'Sales', 
      dataIndex: ['_count', 'sales'], 
      key: 'sales', 
      width: 100, 
      align: 'center' as const,
      render: (count: number) => <Tag color="blue">{count}</Tag> 
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status', 
      width: 90, 
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'error'} bordered={false}>
          {status?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="text" icon={<EditOutlined style={{ color: '#1890ff' }} />} onClick={() => handleEdit(record)} />
          <Popconfirm title="Delete?" onConfirm={() => deleteMutation.mutate(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card bordered={false} className="enterprise-card" bodyStyle={{ padding: isMobile ? '12px' : '24px' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <Title level={isMobile ? 5 : 4} style={{ margin: 0 }}>Sales Persons</Title>
            <Button 
              type="primary" 
              icon={<UserAddOutlined />} 
              onClick={() => { setEditingRecord(null); form.resetFields(); setIsModalOpen(true); }}
              block={isMobile}
            >
              Add Sales Person
            </Button>
          </div>
          
          <Row gutter={[8, 8]}>
            <Col xs={24} sm={12} md={12}>
              <Input
                placeholder="Search sales persons..."
                prefix={<SearchOutlined />}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: '100%' }}
                allowClear
              />
            </Col>
            <Col xs={12} sm={6} md={6}>
              <Button icon={<FileExcelOutlined />} onClick={handleExport} block>Excel</Button>
            </Col>
            <Col xs={12} sm={6} md={6}>
              <Button icon={<PrinterOutlined />} onClick={() => window.print()} block>Print</Button>
            </Col>
          </Row>
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredData} 
          loading={isLoading} 
          rowKey="id" 
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 10 }}
          size={isMobile ? "small" : "middle"}
          bordered
        />
      </Card>

      <Modal
        title={editingRecord ? 'Edit Sales Person' : 'Add New Sales Person'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={isMobile ? '95%' : 600}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: 'active' }}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="phone" label="Phone">
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
                <Input prefix={<MailOutlined />} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="status" label="Status">
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
              <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
                Save
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SalesPersonsPage;

