import { Table, Tag, Card, Input, Select, Space, message, Button, Row, Col, Grid, Modal, Form, Typography, Popconfirm } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import dayjs from 'dayjs';
import { SearchOutlined, FileExcelOutlined, PrinterOutlined, HistoryOutlined, EditOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { exportToCSV } from '../utils/csvExport';
import { useNavigate } from 'react-router-dom';

const { useBreakpoint } = Grid;
const { TextArea } = Input;
const { Text } = Typography;

const PreviousPendingPage = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [form] = Form.useForm();

  // Fetch Sales
  const { data: sales, isLoading, isError } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const response = await api.get('/sales');
      return response.data;
    },
  });

  // Fetch Engineers for Select
  const { data: engineers } = useQuery({
    queryKey: ['engineers'],
    queryFn: async () => {
      const response = await api.get('/engineers');
      return response.data;
    },
  });

  // Update Sale Mutation
  const updateMutation = useMutation({
    mutationFn: async (values: any) => {
      const response = await api.put(`/sales/${editingRecord.id}`, values);
      return response.data;
    },
    onSuccess: () => {
      message.success('Record updated successfully');
      setIsEditModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to update');
    },
  });

  // Delete Sale Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/sales/${id}`);
    },
    onSuccess: () => {
      message.success('Record deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to delete');
    },
  });

  // Filter pending sales from PREVIOUS months (not current month)
  const currentMonth = dayjs().startOf('month');
  const previousPendingSales = sales?.filter((sale: any) => {
    const isPending = sale.status !== 'completed' && sale.status !== 'cancelled';
    const isPrevious = dayjs(sale.saleDate).isBefore(currentMonth);
    return isPending && isPrevious;
  });

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      engineerName: record.engineerName === 'N/A' ? '' : record.engineerName,
      followupUpdate: record.update,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (values: any) => {
    updateMutation.mutate(values);
  };

  const handleExport = () => {
    const headers = {
      saleDate: 'Sale Date',
      customerName: 'Customer Name',
      businessName: 'Business Name',
      phone: 'Phone',
      status: 'Status',
      engineerName: 'Engineer',
      update: 'Remarks'
    };
    
    const exportData = filteredData?.map((item: any) => ({
      ...item,
      saleDate: dayjs(item.saleDate).format('DD-MM-YYYY'),
    }));

    exportToCSV(exportData, headers, 'Previous_Pending_Installs');
  };

  const statusUpdateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const response = await api.put(`/sales/${id}`, { status });
      return response.data;
    },
    onSuccess: () => {
      message.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Update failed');
    },
  });

  const filteredData = previousPendingSales?.filter((item: any) => {
    const search = searchText.toLowerCase();
    const customerName = item.customerName?.toLowerCase() || '';
    const businessName = item.businessName?.toLowerCase() || '';
    const phone = item.phone || '';

    return customerName.includes(search) ||
      businessName.includes(search) ||
      phone.includes(search);
  })?.sort((a: any, b: any) => dayjs(a.saleDate).unix() - dayjs(b.saleDate).unix());

  const columns = [
    { 
      title: 'SL', 
      key: 'slNo', 
      width: 60, 
      render: (_: any, __: any, index: number) => index + 1 
    },
    { 
      title: 'Date', 
      dataIndex: 'saleDate', 
      key: 'saleDate', 
      width: 100, 
      render: (date: string) => (
        <Space direction="vertical" size={0}>
          <Text strong>{dayjs(date).format('DD-MM-YY')}</Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {dayjs().diff(dayjs(date), 'day')} days ago
          </Text>
        </Space>
      )
    },
    { 
      title: 'Customer/Business', 
      key: 'customerBusiness', 
      width: 250,
      render: (_: any, record: any) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.customerName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.businessName}</div>
        </div>
      )
    },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', width: 130 },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status', 
      width: 150, 
      render: (status: string, record: any) => (
        <Select
          value={status}
          onChange={(value) => statusUpdateMutation.mutate({ id: record.id, status: value })}
          style={{ width: '100%' }}
          loading={statusUpdateMutation.isPending && statusUpdateMutation.variables?.id === record.id}
          bordered={false}
          size="small"
        >
          <Select.Option value="pending"><Tag color="orange">PENDING</Tag></Select.Option>
          <Select.Option value="assigned"><Tag color="blue">ASSIGNED</Tag></Select.Option>
          <Select.Option value="in-progress"><Tag color="cyan">IN PROGRESS</Tag></Select.Option>
          <Select.Option value="completed"><Tag color="green">COMPLETED</Tag></Select.Option>
          <Select.Option value="cancelled"><Tag color="red">CANCELLED</Tag></Select.Option>
        </Select>
      )
    },
    { title: 'Engineer', dataIndex: 'engineerName', key: 'engineerName', width: 130 },
    { title: 'Remarks', dataIndex: 'update', key: 'update', width: 250 },
    {
      title: 'Action',
      key: 'action',
      fixed: (isMobile ? false : 'right') as any,
      width: 100,
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

  if (isError) {
    return (
      <Card style={{ textAlign: 'center', marginTop: 50 }}>
        <h3>Error loading pending data</h3>
      </Card>
    );
  }

  return (
    <div>
      <Card 
        bordered={false} 
        className="enterprise-card" 
        bodyStyle={{ padding: isMobile ? '12px' : '24px' }}
      >
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: isMobile ? '18px' : '24px' }}>
              <HistoryOutlined style={{ color: '#faad14', marginRight: 8 }} />
              Previous Pending Installs
            </h2>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => navigate('/entry')}
              block={isMobile}
            >
              New Entry
            </Button>
          </div>
          
          <Row gutter={[8, 8]}>
            <Col xs={24} sm={12} md={12}>
              <Input
                placeholder="Search older pending installs..."
                prefix={<SearchOutlined />}
                onChange={e => setSearchText(e.target.value)}
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
          scroll={{ x: 'max-content', y: isMobile ? undefined : 'calc(100vh - 350px)' }}
          pagination={isMobile ? { pageSize: 10 } : false}
          bordered
          size={isMobile ? "small" : "middle"}
        />
      </Card>

      <Modal
        title="Update Previous Pending Record"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        width={isMobile ? '95%' : 500}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item name="status" label="Status">
            <Select>
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="assigned">Assigned</Select.Option>
              <Select.Option value="in-progress">In Progress</Select.Option>
              <Select.Option value="completed">Completed</Select.Option>
              <Select.Option value="cancelled">Cancelled</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="engineerName" label="Engineer">
            <Select showSearch placeholder="Select Engineer" optionFilterProp="children">
              {engineers?.map((eng: any) => (
                <Select.Option key={eng.id} value={eng.name}>{eng.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="followupUpdate" label="Notes/Remarks">
            <TextArea rows={4} placeholder="Update remarks for this installation..." />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
                Update Record
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PreviousPendingPage;
