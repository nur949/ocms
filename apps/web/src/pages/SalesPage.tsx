import { Table, Button, Space, Tag, Card, Modal, Form, Input, InputNumber, Select, DatePicker, message, Popconfirm, Checkbox, Row, Col, Grid, Drawer, Descriptions, Divider, Typography, Tooltip } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useNavigate } from 'react-router-dom';
import { EyeOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, MinusCircleOutlined, FileExcelOutlined, PrinterOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { exportToCSV } from '../utils/csvExport';
import StatusBadge from '../components/StatusBadge';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { TextArea } = Input;
const { useBreakpoint } = Grid;
const { Text, Title } = Typography;

const SalesPage = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(dayjs().month()); // 0-11
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  // Fetch Engineers
  const { data: engineers } = useQuery({
    queryKey: ['engineers'],
    queryFn: async () => {
      const response = await api.get('/engineers');
      return response.data;
    },
  });

  // Fetch Devices
  const { data: devicesList } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const response = await api.get('/devices');
      return response.data;
    },
  });

  // Fetch Sales
  const { data: sales, isLoading, isError } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const response = await api.get('/sales');
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
      message.success('Sale updated successfully');
      setIsEditModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to update sale');
    },
  });

  // Delete Sale Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/sales/${id}`);
    },
    onSuccess: () => {
      message.success('Sale deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to delete sale');
    },
  });

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    const phoneArray = record.phone ? record.phone.split(', ') : [''];
    
    form.setFieldsValue({
      ...record,
      phone: phoneArray,
      saleDate: record.saleDate ? dayjs(record.saleDate) : null,
      installDate: record.installDate ? dayjs(record.installDate) : null,
      softwarePrice: record.softPrice,
      monthlyCharge: record.mCharge,
      advanceAmount: record.advance,
      deviceIds: record.deviceIds,
      followupUpdate: record.update,
      engineerName: record.engineerName === 'N/A' ? '' : record.engineerName,
    });
    setIsEditModalOpen(true);
  };

  const handleViewDetails = (record: any) => {
    setSelectedRecord(record);
    setIsDetailDrawerOpen(true);
  };

  const handleEditSubmit = (values: any) => {
    updateMutation.mutate({
      ...values,
      saleDate: values.saleDate ? values.saleDate.toISOString() : undefined,
      installDate: values.installDate ? values.installDate.toISOString() : undefined,
      softwarePrice: parseFloat(values.softwarePrice) || 0,
      monthlyCharge: parseFloat(values.monthlyCharge) || 0,
      advanceAmount: parseFloat(values.advanceAmount) || 0,
    });
  };

  const filteredData = sales?.filter((item: any) => {
    const search = searchText.toLowerCase();
    const customerName = item.customerName?.toLowerCase() || '';
    const businessName = item.businessName?.toLowerCase() || '';
    const phone = item.phone || '';

    const matchesSearch = customerName.includes(search) ||
      businessName.includes(search) ||
      phone.includes(search);
    
    const itemDate = dayjs(item.saleDate);
    const matchesYear = itemDate.year() === selectedYear;
    const matchesMonth = selectedMonth !== null ? itemDate.month() === selectedMonth : true;
    
    return matchesSearch && matchesYear && matchesMonth;
  })?.sort((a: any, b: any) => dayjs(a.saleDate).unix() - dayjs(b.saleDate).unix());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => dayjs().year() - 2 + i);

  const columns = [
    { 
      title: 'SL', 
      key: 'slNo', 
      width: 60, 
      fixed: (isMobile ? false : 'left') as any, 
      render: (_: any, __: any, index: number) => index + 1 
    },
    { 
      title: 'Sale Date', 
      dataIndex: 'saleDate', 
      key: 'saleDate', 
      width: 100, 
      render: (date: string) => dayjs(date).format('DD-MM-YY'), 
      sorter: (a: any, b: any) => dayjs(a.saleDate).unix() - dayjs(b.saleDate).unix() 
    },
    { 
      title: 'Install Date', 
      dataIndex: 'installDate', 
      key: 'installDate', 
      width: 100, 
      render: (date: string) => date ? dayjs(date).format('DD-MM-YY') : <Text type="secondary">N/A</Text>,
      sorter: (a: any, b: any) => {
        if (!a.installDate) return 1;
        if (!b.installDate) return -1;
        return dayjs(a.installDate).unix() - dayjs(b.installDate).unix();
      }
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
    { title: 'Price', dataIndex: 'softPrice', key: 'softPrice', width: 100, render: (price: number) => `৳${price.toLocaleString()}` },
    { title: 'Due', dataIndex: 'due', key: 'due', width: 100, render: (due: number) => (
      <Tag color={due > 0 ? 'red' : 'green'}>৳{due.toLocaleString()}</Tag>
    )},
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status', 
      width: 160, 
      render: (status: string) => <StatusBadge status={status} />
    },
    { 
      title: 'Devices', 
      dataIndex: 'deviceNames', 
      key: 'deviceNames', 
      width: 220,
      render: (names: string) => {
        if (!names) return <Text type="secondary">None</Text>;
        const deviceList = names.split(', ');
        const displayLimit = 2;
        const visibleDevices = deviceList.slice(0, displayLimit);
        const remainingCount = deviceList.length - displayLimit;
        const remainingDevices = deviceList.slice(displayLimit).join(', ');

        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {visibleDevices.map((name, idx) => (
              <Tag 
                key={idx} 
                color="blue" 
                style={{ 
                  margin: 0, 
                  borderRadius: '4px', 
                  fontSize: '11px', 
                  fontWeight: 500,
                  border: 'none',
                  background: 'rgba(24, 144, 255, 0.1)',
                  color: '#1890ff'
                }}
              >
                {name}
              </Tag>
            ))}
            {remainingCount > 0 && (
              <Tooltip title={remainingDevices}>
                <Tag 
                  color="default" 
                  style={{ 
                    margin: 0, 
                    borderRadius: '4px', 
                    fontSize: '11px', 
                    cursor: 'pointer' 
                  }}
                >
                  +{remainingCount} more
                </Tag>
              </Tooltip>
            )}
          </div>
        );
      }
    },
    { 
      title: 'Engineer', 
      dataIndex: 'engineerName', 
      key: 'engineerName', 
      width: 130,
      render: (name: string) => (name === 'N/A' || !name) ? '' : name
    },
    {
      title: 'Action',
      key: 'action',
      fixed: (isMobile ? false : 'right') as any,
      width: 110,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="text" icon={<EyeOutlined style={{ color: '#1890ff' }} />} onClick={() => handleViewDetails(record)} />
          <Button type="text" icon={<EditOutlined style={{ color: '#faad14' }} />} onClick={() => handleEdit(record)} />
        </Space>
      ),
    },
  ];

  const handleExport = () => {
    const headers = {
      saleDate: 'Sale Date',
      installDate: 'Install Date',
      customerName: 'Customer Name',
      businessName: 'Business Name',
      phone: 'Phone',
      location: 'Location',
      softPrice: 'Software Price',
      mCharge: 'Monthly Charge',
      advance: 'Advance',
      due: 'Due',
      status: 'Status',
      engineerName: 'Engineer',
      soldBy: 'Sold By',
      deviceNames: 'Devices',
      update: 'Remarks'
    };
    
    const exportData = filteredData?.map((item: any) => ({
      ...item,
      saleDate: dayjs(item.saleDate).format('DD-MM-YYYY'),
      installDate: item.installDate ? dayjs(item.installDate).format('DD-MM-YYYY') : 'N/A',
    }));

    exportToCSV(exportData, headers, 'Sales_Report');
  };

  if (isError) {
    return (
      <Card style={{ textAlign: 'center', marginTop: 50 }}>
        <h3>Error loading sales data</h3>
        <p>Please check if the API server is running or try again later.</p>
      </Card>
    );
  }

  return (
    <div>
      <Card bordered={false} className="enterprise-card" bodyStyle={{ padding: isMobile ? '12px' : '24px' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: isMobile ? '18px' : '24px' }}>Sales & Installation</h2>
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
            <Col xs={12} sm={6} md={4}>
              <Select
                placeholder="Year"
                value={selectedYear}
                onChange={value => setSelectedYear(value)}
                style={{ width: '100%' }}
              >
                {years.map(y => (
                  <Select.Option key={y} value={y}>{y}</Select.Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} sm={6} md={6}>
              <Select
                placeholder="Month"
                value={selectedMonth}
                onChange={value => setSelectedMonth(value)}
                style={{ width: '100%' }}
                allowClear
              >
                {months.map((m, i) => (
                  <Select.Option key={i} value={i}>{m}</Select.Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Search..."
                prefix={<SearchOutlined />}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: '100%' }}
                allowClear
              />
            </Col>
            <Col xs={24} sm={24} md={6} style={{ display: 'flex', gap: 8 }}>
              <Button 
                icon={<FileExcelOutlined />} 
                onClick={handleExport}
                disabled={!filteredData || filteredData.length === 0}
                style={{ flex: 1 }}
              >
                Excel
              </Button>
              <Button 
                icon={<PrinterOutlined />} 
                onClick={() => window.print()}
                disabled={!filteredData || filteredData.length === 0}
                style={{ flex: 1 }}
              >
                Print
              </Button>
            </Col>
          </Row>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={filteredData} 
          loading={isLoading} 
          rowKey="id" 
          scroll={{ x: 'max-content', y: isMobile ? undefined : 'calc(100vh - 400px)' }}
          pagination={isMobile ? { pageSize: 10 } : false}
          bordered
          size={isMobile ? "small" : "middle"}
        />
      </Card>

      <Modal
        title="Edit Record"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        width={isMobile ? '95%' : 800}
        centered
        style={{ top: 20 }}
      >
        <Form form={form} layout="vertical" onFinish={handleEditSubmit}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="customerName" label="Customer Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="businessName" label="Business Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Form.List
                name="phone"
                rules={[
                  {
                    validator: async (_, names) => {
                      if (!names || names.length < 1) {
                        return Promise.reject(new Error('At least one phone number is required'));
                      }
                    },
                  },
                ]}
              >
                {(fields, { add, remove }, { errors }) => (
                  <Form.Item label="Phone Number(s)" required>
                    {fields.map((field) => (
                      <Form.Item
                        required={false}
                        key={field.key}
                        style={{ marginBottom: 8 }}
                      >
                        <Space align="baseline" style={{ display: 'flex', width: '100%' }}>
                          <Form.Item
                            {...field}
                            validateTrigger={['onChange', 'onBlur']}
                            rules={[{ required: true, whitespace: true, message: "Please input phone number or delete this field." }]}
                            noStyle
                          >
                            <Input placeholder="Enter Phone Number" style={{ width: '100%' }} />
                          </Form.Item>
                          {fields.length > 1 && (
                            <MinusCircleOutlined
                              onClick={() => remove(field.name)}
                              style={{ fontSize: '18px', color: '#ff4d4f' }}
                            />
                          )}
                        </Space>
                      </Form.Item>
                    ))}
                    <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                      Add Phone
                    </Button>
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                )}
              </Form.List>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item name="location" label="Location">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Item name="saleDate" label="Sale Date">
                <DatePicker style={{ width: '100%' }} format="DD-MM-YY" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Item name="installDate" label="Install Date">
                <DatePicker style={{ width: '100%' }} format="DD-MM-YY" />
              </Form.Item>
            </Col>
            
            <Col xs={12} sm={8}>
              <Form.Item name="softwarePrice" label="Price">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={12} sm={8}>
              <Form.Item name="monthlyCharge" label="Monthly">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="advanceAmount" label="Advance">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item name="status" label="Status">
                <Select>
                  <Select.Option value="pending">Pending</Select.Option>
                  <Select.Option value="assigned">Assigned</Select.Option>
                  <Select.Option value="in-progress">In Progress</Select.Option>
                  <Select.Option value="completed">Completed</Select.Option>
                  <Select.Option value="cancelled">Cancelled</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="engineerName" label="Engineer">
                <Select showSearch placeholder="Select Engineer" optionFilterProp="children">
                  {engineers?.map((eng: any) => (
                    <Select.Option key={eng.id} value={eng.name}>{eng.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="deviceIds" label="Devices">
            <Checkbox.Group style={{ width: '100%' }}>
              <Row gutter={[8, 8]}>
                {devicesList?.map((device: any) => (
                  <Col xs={12} sm={6} key={device.id}>
                    <Checkbox value={device.id}>{device.name}</Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item name="followupUpdate" label="Notes">
            <TextArea rows={3} />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Popconfirm
                title="Permanently delete this record?"
                onConfirm={() => deleteMutation.mutate(editingRecord.id)}
                okText="Yes, Delete"
                cancelText="No"
                okButtonProps={{ danger: true }}
              >
                <Button danger type="text" icon={<DeleteOutlined />}>
                  Delete Record
                </Button>
              </Popconfirm>
              <Space>
                <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
                  Save Changes
                </Button>
              </Space>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="Installation Details"
        placement="right"
        onClose={() => setIsDetailDrawerOpen(false)}
        open={isDetailDrawerOpen}
        width={isMobile ? '100%' : 600}
      >
        {selectedRecord && (
          <div>
            <Descriptions title="Customer Information" bordered column={1} size="small">
              <Descriptions.Item label="Customer Name">{selectedRecord.customerName}</Descriptions.Item>
              <Descriptions.Item label="Business Name">{selectedRecord.businessName}</Descriptions.Item>
              <Descriptions.Item label="Phone">{selectedRecord.phone}</Descriptions.Item>
              <Descriptions.Item label="Location">{selectedRecord.location || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Address">{selectedRecord.address || 'N/A'}</Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '16px 0' }} />

            <Descriptions title="Sale & Installation" bordered column={1} size="small">
              <Descriptions.Item label="Sale Date">{dayjs(selectedRecord.saleDate).format('DD MMMM, YYYY')}</Descriptions.Item>
              <Descriptions.Item label="Install Date">{selectedRecord.installDate ? dayjs(selectedRecord.installDate).format('DD MMMM, YYYY') : 'Not Scheduled'}</Descriptions.Item>
              <Descriptions.Item label="Status"><StatusBadge status={selectedRecord.status} /></Descriptions.Item>
              <Descriptions.Item label="Engineer">{selectedRecord.engineerName}</Descriptions.Item>
              <Descriptions.Item label="Sold By">{selectedRecord.soldBy}</Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '16px 0' }} />

            <Descriptions title="Financial Details" bordered column={1} size="small">
              <Descriptions.Item label="Software Price">৳{selectedRecord.softPrice?.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Monthly Charge">৳{selectedRecord.mCharge?.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Advance Payment">৳{selectedRecord.advance?.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Due Amount">
                <Text type={selectedRecord.due > 0 ? 'danger' : 'success'} strong>
                  ৳{selectedRecord.due?.toLocaleString()}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '16px 0' }} />
            
            <Title level={5} style={{ fontSize: '14px', marginBottom: 8 }}>Equipment / Devices</Title>
            {selectedRecord.deviceNames ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedRecord.deviceNames.split(', ').map((device: string, idx: number) => (
                  <Tag key={idx} color="cyan" style={{ padding: '4px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #87e8de' }}>
                    {device}
                  </Tag>
                ))}
              </div>
            ) : (
              <Text type="secondary">No devices recorded</Text>
            )}

            <Divider style={{ margin: '16px 0' }} />

            <Title level={5} style={{ fontSize: '14px', marginBottom: 8 }}>Remarks / Follow-up</Title>
            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px', fontStyle: 'italic', fontSize: '13px' }}>
              {selectedRecord.update || 'No remarks provided.'}
            </div>
            
            <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
              <Button type="primary" icon={<EditOutlined />} onClick={() => {
                setIsDetailDrawerOpen(false);
                handleEdit(selectedRecord);
              }} block>
                Edit Record
              </Button>
              <Button onClick={() => setIsDetailDrawerOpen(false)} block>
                Close
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default SalesPage;
