import { Table, Tag, Card, Input, Space, Button, message, Popconfirm } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import dayjs from 'dayjs';
import { SearchOutlined, FileExcelOutlined, PrinterOutlined, DeleteOutlined, UndoOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { exportToCSV } from '../utils/csvExport';

const CancelledInstallsPage = () => {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');

  const { data: sales, isLoading, isError } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const response = await api.get('/sales');
      return response.data;
    },
  });

  const cancelledSales = sales?.filter((sale: any) => sale.status === 'cancelled');

  const statusUpdateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const response = await api.put(`/sales/${id}`, { status });
      return response.data;
    },
    onSuccess: () => {
      message.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Update failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/sales/${id}`);
    },
    onSuccess: () => {
      message.success('Record deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to delete');
    },
  });

  const handleExport = () => {
    const headers = {
      saleDate: 'Sale Date',
      customerName: 'Customer Name',
      businessName: 'Business Name',
      phone: 'Phone',
      location: 'Location',
      softPrice: 'Software Price',
      engineerName: 'Engineer',
      update: 'Remarks/Reason'
    };
    
    const exportData = filteredData?.map((item: any) => ({
      ...item,
      saleDate: dayjs(item.saleDate).format('DD-MM-YYYY'),
    }));

    exportToCSV(exportData, headers, 'Cancelled_Installs');
  };

  const filteredData = cancelledSales?.filter((item: any) => {
    const search = searchText.toLowerCase();
    return item.customerName.toLowerCase().includes(search) ||
      item.businessName.toLowerCase().includes(search) ||
      item.phone.includes(search);
  })?.sort((a: any, b: any) => dayjs(b.saleDate).unix() - dayjs(a.saleDate).unix());

  const columns = [
    { 
      title: 'SL', 
      key: 'slNo', 
      width: 60, 
      render: (_: any, __: any, index: number) => index + 1 
    },
    { title: 'Sale Date', dataIndex: 'saleDate', key: 'saleDate', width: 110, render: (date: string) => dayjs(date).format('DD-MM-YY') },
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
      width: 140, 
      render: () => <Tag color="red">CANCELLED</Tag>
    },
    { title: 'Price', dataIndex: 'softPrice', key: 'softPrice', width: 100, render: (price: number) => `৳${price.toLocaleString()}` },
    { title: 'Remarks', dataIndex: 'update', key: 'update', width: 250 },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="middle">
          <Popconfirm 
            title="Restore this installation?" 
            onConfirm={() => statusUpdateMutation.mutate({ id: record.id, status: 'pending' })}
          >
            <Button type="text" icon={<UndoOutlined style={{ color: '#52c41a' }} />} title="Restore to Pending" />
          </Popconfirm>
          <Popconfirm title="Delete permanently?" onConfirm={() => deleteMutation.mutate(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (isError) {
    return (
      <Card style={{ textAlign: 'center', marginTop: 50 }}>
        <h3>Error loading cancelled data</h3>
      </Card>
    );
  }

  return (
    <div>
      <Card bordered={false} className="enterprise-card">
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <h2 style={{ margin: 0 }}>Cancelled Installations</h2>
          <Space wrap>
            <Input
              placeholder="Search cancelled installs..."
              prefix={<SearchOutlined />}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
            <Button icon={<FileExcelOutlined />} onClick={handleExport}>Excel</Button>
            <Button icon={<PrinterOutlined />} onClick={() => window.print()}>Print</Button>
          </Space>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={filteredData} 
          loading={isLoading} 
          rowKey="id" 
          scroll={{ x: 1200, y: 'calc(100vh - 350px)' }}
          pagination={{ pageSize: 15 }}
          bordered
          size="middle"
        />
      </Card>
    </div>
  );
};

export default CancelledInstallsPage;
