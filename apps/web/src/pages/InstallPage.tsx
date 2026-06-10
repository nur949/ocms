import { Table, Tag, Card, Input, Space, Select, Button } from 'antd';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import dayjs from 'dayjs';
import { SearchOutlined, FileExcelOutlined, PrinterOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { exportToCSV } from '../utils/csvExport';

const InstallPage = () => {
  const [searchText, setSearchText] = useState('');

  const { data: sales, isLoading, isError } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const response = await api.get('/sales');
      return response.data;
    },
  });

  const completedSales = sales?.filter((sale: any) => sale.status === 'completed');

  const handleExport = () => {
    const headers = {
      installDate: 'Install Date',
      customerName: 'Customer Name',
      businessName: 'Business Name',
      phone: 'Phone',
      location: 'Location',
      softPrice: 'Software Price',
      engineerName: 'Engineer',
      deviceNames: 'Devices',
      update: 'Remarks'
    };
    
    const exportData = filteredData?.map((item: any) => ({
      ...item,
      installDate: item.installDate ? dayjs(item.installDate).format('DD-MM-YYYY') : 'N/A',
    }));

    exportToCSV(exportData, headers, 'Installed_Report');
  };

  const filteredData = completedSales?.filter((item: any) => {
    return item.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.businessName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.phone.includes(searchText);
  })?.sort((a: any, b: any) => dayjs(b.installDate).unix() - dayjs(a.installDate).unix());

  const columns = [
    { 
      title: 'SL No', 
      key: 'slNo', 
      width: 80, 
      fixed: 'left' as const, 
      render: (_: any, __: any, index: number) => index + 1 
    },
    { title: 'Install Date', dataIndex: 'installDate', key: 'installDate', width: 120, render: (date: string) => date ? dayjs(date).format('DD-MM-YY') : 'N/A', sorter: (a: any, b: any) => dayjs(a.installDate).unix() - dayjs(b.installDate).unix() },
    { title: 'Customer', dataIndex: 'customerName', key: 'customerName', width: 180 },
    { title: 'Business', dataIndex: 'businessName', key: 'businessName', width: 200 },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', width: 130 },
    { title: 'Location', dataIndex: 'location', key: 'location', width: 180 },
    { title: 'Price', dataIndex: 'softPrice', key: 'softPrice', width: 110, render: (price: number) => `৳${price.toLocaleString()}` },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status', 
      width: 130, 
      render: () => <Tag color="green">COMPLETED</Tag>
    },
    { title: 'Engineer', dataIndex: 'engineerName', key: 'engineerName', width: 150 },
    { 
      title: 'Devices', 
      dataIndex: 'deviceNames', 
      key: 'deviceNames', 
      width: 200,
      render: (_: string, record: any) => {
        const devices = record.deviceNames ? record.deviceNames.split(', ') : [];
        if (devices.length === 0) return 'N/A';
        return (
          <Select 
            defaultValue={devices[0]} 
            style={{ width: '100%' }} 
            bordered={false}
            dropdownStyle={{ minWidth: 150 }}
          >
            {devices.map((d: string, i: number) => (
              <Select.Option key={i} value={d}>{d}</Select.Option>
            ))}
          </Select>
        );
      }
    },
    { title: 'Remarks', dataIndex: 'update', key: 'update', width: 300 },
  ];

  if (isError) {
    return (
      <Card style={{ textAlign: 'center', marginTop: 50 }}>
        <h3>Error loading installation data</h3>
        <p>Please check if the API server is running or try again later.</p>
      </Card>
    );
  }

  return (
    <div style={{ padding: '0 8px' }}>
      <Card bordered={false}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <h2 style={{ margin: 0 }}>Installed</h2>
          <Space wrap>
            <Input
              placeholder="Search customers, business or phone"
              prefix={<SearchOutlined />}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
            <Button 
              icon={<FileExcelOutlined />} 
              onClick={handleExport}
              disabled={!filteredData || filteredData.length === 0}
            >
              Export CSV
            </Button>
            <Button 
              icon={<PrinterOutlined />} 
              onClick={() => window.print()}
              disabled={!filteredData || filteredData.length === 0}
            >
              Print
            </Button>
          </Space>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={filteredData} 
          loading={isLoading} 
          rowKey="id" 
          scroll={{ x: 1800, y: 'calc(100vh - 300px)' }}
          pagination={false}
          bordered
          size="middle"
        />
      </Card>
    </div>
  );
};

export default InstallPage;
