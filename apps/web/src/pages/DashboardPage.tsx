import { Row, Col, Card, Statistic, Spin, Table, Typography, Button } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import Chart from 'react-apexcharts';
import { ShoppingOutlined, ToolOutlined, CloseCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { API_URL } from '../utils/config';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import StatusBadge from '../components/StatusBadge';

const { Text } = Typography;

const DashboardPage = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/reports/dashboard`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    },
  });

  if (isLoading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  if (isError || !data) {
    return (
      <Card style={{ textAlign: 'center', marginTop: 50 }}>
        <h3>Error loading dashboard data</h3>
        <p>Please check if the API server is running or try again later.</p>
      </Card>
    );
  }

  const { stats, salesTrend = [], recentSales = [] } = data;

  const chartOptions: any = {
    chart: { 
      id: 'sales-trend',
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    colors: ['#1890ff'],
    stroke: { curve: 'smooth', width: 3 },
    xaxis: { 
      categories: salesTrend.map((s: any) => dayjs(s.saleDate).format('DD MMM')),
      labels: { style: { colors: '#8c8c8c' } }
    },
    yaxis: {
      labels: { style: { colors: '#8c8c8c' } }
    },
    dataLabels: { enabled: false },
    tooltip: { x: { format: 'dd MMM' } },
    title: { 
      text: 'Revenue Trend',
      style: { fontSize: '16px', fontWeight: 600, color: '#262626' }
    },
  };

  const chartSeries = [
    { name: 'Revenue', data: salesTrend.map((s: any) => s.revenue) },
  ];

  const recentSalesColumns = [
    { 
      title: 'Customer', 
      key: 'customer', 
      render: (_: any, record: any) => (
        <div>
          <Text strong>{record.customerName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.businessName}</Text>
        </div>
      )
    },
    { 
      title: 'Date', 
      dataIndex: 'saleDate', 
      key: 'saleDate', 
      render: (date: string) => dayjs(date).format('DD MMM, YYYY') 
    },
    { 
      title: 'Amount', 
      dataIndex: 'softwarePrice', 
      key: 'softwarePrice', 
      render: (price: number) => <Text strong>৳{price.toLocaleString()}</Text>
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status', 
      render: (status: string) => <StatusBadge status={status} />
    }
  ];

  return (
    <div style={{ padding: '4px' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={4} xl={4}>
          <Card 
            hoverable 
            onClick={() => navigate('/report')}
            style={{ 
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 12px rgba(24, 144, 255, 0.2)'
            }}
            bodyStyle={{ padding: '16px' }}
          >
            <Statistic 
              title={<span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '13px', fontWeight: 500 }}>Total Sales</span>}
              value={stats.totalSales} 
              prefix={<ShoppingOutlined style={{ color: 'white' }} />} 
              valueStyle={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={5} xl={5}>
          <Card 
            hoverable 
            onClick={() => navigate('/pending')}
            style={{ 
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #ffa940 0%, #d46b08 100%)',
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 12px rgba(250, 173, 20, 0.2)'
            }}
            bodyStyle={{ padding: '16px' }}
          >
            <Statistic 
              title={<span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '13px', fontWeight: 500 }}>Current Pending</span>}
              value={stats.pendingInstallations} 
              prefix={<ToolOutlined style={{ color: 'white' }} />} 
              valueStyle={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={5} xl={5}>
          <Card 
            hoverable 
            onClick={() => navigate('/previous-pending')}
            style={{ 
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)',
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 12px rgba(255, 77, 79, 0.2)'
            }}
            bodyStyle={{ padding: '16px' }}
          >
            <Statistic 
              title={<span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '13px', fontWeight: 500 }}>Previous Pending</span>}
              value={stats.previousPendingInstallations} 
              prefix={<ToolOutlined style={{ color: 'white' }} />} 
              valueStyle={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={5} xl={5}>
          <Card 
            hoverable 
            onClick={() => navigate('/install')}
            style={{ 
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 12px rgba(82, 196, 26, 0.2)'
            }}
            bodyStyle={{ padding: '16px' }}
          >
            <Statistic 
              title={<span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '13px', fontWeight: 500 }}>Done Installs</span>}
              value={stats.completedInstallations} 
              prefix={<ToolOutlined style={{ color: 'white' }} />} 
              valueStyle={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={5} xl={5}>
          <Card 
            hoverable 
            onClick={() => navigate('/cancelled')}
            style={{ 
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #8c8c8c 0%, #595959 100%)',
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
            bodyStyle={{ padding: '16px' }}
          >
            <Statistic 
              title={<span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '13px', fontWeight: 500 }}>Cancelled Installs</span>}
              value={stats.cancelledInstallations} 
              prefix={<CloseCircleOutlined style={{ color: 'white' }} />} 
              valueStyle={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card bordered={false} className="enterprise-card" bodyStyle={{ padding: '24px' }}>
            <Chart options={chartOptions} series={chartSeries} type="area" height={350} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title="Recent Sales" 
            bordered={false} 
            className="enterprise-card" 
            extra={<Button type="link" onClick={() => navigate('/report')}>View All <ArrowRightOutlined /></Button>}
            bodyStyle={{ padding: '0 12px' }}
          >
            <Table 
              columns={recentSalesColumns} 
              dataSource={recentSales.slice(0, 5)} 
              pagination={false} 
              rowKey="id"
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
