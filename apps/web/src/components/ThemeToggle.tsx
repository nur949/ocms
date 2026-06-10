import React from 'react';
import { Button, Dropdown } from 'antd';
import { SunOutlined, MoonOutlined, DesktopOutlined, CheckOutlined } from '@ant-design/icons';
import { useThemeStore } from '../store/themeStore';
import type { MenuProps } from 'antd';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useThemeStore();

  const items: MenuProps['items'] = [
    {
      key: 'light',
      label: 'Light',
      icon: <SunOutlined />,
      onClick: () => setTheme('light'),
      extra: theme === 'light' ? <CheckOutlined /> : null,
    },
    {
      key: 'dark',
      label: 'Dark',
      icon: <MoonOutlined />,
      onClick: () => setTheme('dark'),
      extra: theme === 'dark' ? <CheckOutlined /> : null,
    },
    {
      key: 'system',
      label: 'System',
      icon: <DesktopOutlined />,
      onClick: () => setTheme('system'),
      extra: theme === 'system' ? <CheckOutlined /> : null,
    },
  ];

  const getIcon = () => {
    switch (theme) {
      case 'light': return <SunOutlined />;
      case 'dark': return <MoonOutlined />;
      default: return <DesktopOutlined />;
    }
  };

  return (
    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
      <Button 
        type="text" 
        icon={getIcon()} 
        style={{ fontSize: '18px', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
      />
    </Dropdown>
  );
};

export default ThemeToggle;
