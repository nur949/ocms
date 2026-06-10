import { Table, Tag, Card, Input, Select, message, Button, Row, Col, Grid } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import dayjs from 'dayjs';
import { SearchOutlined, FileExcelOutlined, PrinterOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { exportToCSV } from '../utils/csvExport';

const { useBreakpoint } = Grid;

const PendingInstallsPage = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');

  const { data: sales, isLoading, isError } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const response = await api.get('/sales');
      return response.data;
    },
  });

  // Filter pending sales for CURRENT month
  const currentMonth = dayjs().startOf('month');
  const pendingSales = sales?.filter((sale: any) => {
    const isPending = sale.status !== 'completed' && sale.status !== 'cancelled';
    const isCurrent = !dayjs(sale.saleDate).isBefore(currentMonth);
    return isPending && isCurrent;
  });

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

  const handleExport = () => {
    const headers = {
      saleDate: 'Sale Date',
      customerName: 'Customer Name',
      businessName: 'Business Name',
      phone: 'Phone',
      status: 'Status',
      engineerName: 'Engineer',
      deviceNames: 'Devices',
      update: 'Remarks'
    };
    
    const exportData = filteredData?.map((item: any) => ({
      ...item,
      saleDate: dayjs(item.saleDate).format('DD-MM-YYYY'),
    }));

    exportToCSV(exportData, headers, 'Pending_Installs');
  };

  const filteredData = pendingSales?.filter((item: any) => {
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
    { title: 'Date', dataIndex: 'saleDate', key: 'saleDate', width: 100, render: (date: string) => dayjs(date).format('DD-MM-YY') },
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
      <Card bordered={false} className="enterprise-card" bodyStyle={{ padding: isMobile ? '12px' : '24px' }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ marginBottom: 16, fontSize: isMobile ? '18px' : '24px' }}>Pending Installs</h2>
          <Row gutter={[8, 8]}>
            <Col xs={24} sm={12} md={12}>
              <Input
                placeholder="Search pending..."
                prefix={<SearchOutlined />}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: '100%' }}
                allowClear
              />
            </Col>
            <Col xs={12} sm={6} md={6}>
              <Button 
                icon={<FileExcelOutlined />} 
                onClick={handleExport}
                disabled={!filteredData || filteredData.length === 0}
                block
              >
                Excel
              </Button>
            </Col>
            <Col xs={12} sm={6} md={6}>
              <Button 
                icon={<PrinterOutlined />} 
                onClick={() => window.print()}
                disabled={!filteredData || filteredData.length === 0}
                block
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
          scroll={{ x: 'max-content', y: isMobile ? undefined : 'calc(100vh - 350px)' }}
          pagination={isMobile ? { pageSize: 10 } : false}
          bordered
          size={isMobile ? "small" : "middle"}
        />
      </Card>
    </div>
  );
};

export default PendingInstallsPage;
