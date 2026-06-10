import React, { useState } from 'react';
import { Layout, Menu, Button, theme, Dropdown, Avatar, Space, Drawer, Grid } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  LogoutOutlined,
  PlusCircleOutlined,
  FileSearchOutlined,
  TeamOutlined,
  UserOutlined,
  ToolOutlined,
  SettingOutlined,
  DownOutlined,
  MenuOutlined,
  HistoryOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../utils/config';
import type { MenuProps } from 'antd';
import ThemeToggle from '../components/ThemeToggle';

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Fetch Settings for Dynamic Title/Logo
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/settings`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    },
  });

  const siteName = settings?.siteName || 'OCMS Management';
  const shortName = siteName.split(' ').map((w: string) => w[0]).join('').toUpperCase().substring(0, 4);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems: MenuProps['items'] = [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
    { 
      type: 'group',
      label: 'Sales & Marketing',
      children: [
        { key: '/entry', icon: <PlusCircleOutlined />, label: 'New Entry' },
        { key: '/report', icon: <FileSearchOutlined />, label: 'Sales Report' },
        { key: '/staff', icon: <UserOutlined />, label: 'Sales Persons' },
      ]
    },
    {
      type: 'group',
      label: 'Installations',
      children: [
        { key: '/pending', icon: <FileSearchOutlined />, label: 'Pending Install' },
        { key: '/previous-pending', icon: <HistoryOutlined />, label: 'Previous Pending' },
        { key: '/install', icon: <ToolOutlined />, label: 'Installed' },
        { key: '/cancelled', icon: <CloseCircleOutlined />, label: 'Cancelled Installs' },
      ]
    },
    {
      type: 'group',
      label: 'Management',
      children: [
        { key: '/engineers', icon: <TeamOutlined />, label: 'Engineers' },
        { key: '/devices', icon: <ToolOutlined />, label: 'Devices' },
      ]
    }
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Site Settings',
      onClick: () => navigate('/settings'),
    },
    ...(user?.role === 'super-admin' ? [{
      key: 'users',
      icon: <UserOutlined />,
      label: 'User account',
      onClick: () => navigate('/users'),
    }] : []),
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'my account',
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
    if (isMobile) {
      setDrawerVisible(false);
    }
  };

  const SidebarContent = (
    <>
      <div style={{ 
        height: 64, 
        margin: isMobile ? 0 : 16, 
        background: isMobile ? 'transparent' : 'rgba(255, 255, 255, 0.2)', 
        borderRadius: 6, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        color: isMobile ? '#001529' : 'white', 
        fontWeight: 'bold', 
        overflow: 'hidden', 
        padding: '0 8px',
        fontSize: '18px'
      }}>
        {collapsed && !isMobile ? shortName : siteName}
      </div>
      <Menu
        theme={isMobile ? "light" : "dark"}
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed} 
          width={250}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
          }}
        >
          {SidebarContent}
        </Sider>
      )}

      <Drawer
        title={siteName}
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={250}
        styles={{ body: { padding: 0 } }}
      >
        {SidebarContent}
      </Drawer>

      <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 250), transition: 'margin-left 0.2s' }}>
        <Header style={{ 
          padding: '0 16px', 
          background: colorBgContainer, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <Button
            type="text"
            icon={isMobile ? <MenuOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
            onClick={() => isMobile ? setDrawerVisible(true) : setCollapsed(!collapsed)}
            style={{ fontSize: 16, width: 48, height: 48 }}
          />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ThemeToggle />
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
              <Button type="text" style={{ height: 'auto', padding: '4px 8px' }}>
                <Space>
                  <Avatar src={user?.avatar} icon={<UserOutlined />} />
                  {!isMobile && (
                    <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>{user?.name}</span>
                      <span style={{ fontSize: '12px', color: 'rgba(0,0,0,0.45)' }}>{user?.role}</span>
                    </div>
                  )}
                  <DownOutlined style={{ fontSize: '12px', color: 'rgba(0,0,0,0.45)' }} />
                </Space>
              </Button>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: isMobile ? '8px' : '16px',
            padding: isMobile ? 12 : 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;

